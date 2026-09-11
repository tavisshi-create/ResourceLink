using ktr_back.Models;
using ktr_back.Models.Dtos;
using ktr_back.Services;
using Microsoft.AspNetCore.Mvc;

namespace ktr_back.Controllers
{
    /// <summary>
    /// Backs the provider dashboard's "Requests &amp; Notifications" panel.
    /// Unlike the generic <see cref="BaseCrudController{T}"/> controllers,
    /// this one composes three tables (bookings, resource_allocations,
    /// institutions) into a single read model, and exposes a decision
    /// endpoint that keeps the booking's status and the underlying
    /// equipment's availability in sync.
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class ProviderRequestsController : ControllerBase
    {
        // Statuses a booking can be moved to via the accept/reject action.
        private static readonly string[] AllowedBookingStatuses =
        {
            "Pending Payment", "Accepted", "Rejected", "Cancelled", "Completed",
        };

        // Statuses ResourceAllocation.Status is allowed to hold. Kept here
        // (rather than only in ResourceAllocationsController) because
        // accepting/rejecting a request also flips equipment availability.
        private static readonly string[] AllowedEquipmentStatuses =
        {
            "Available", "Rented", "Maintenance",
        };

        private readonly IGenericSupabaseService<Booking> _bookings;
        private readonly IGenericSupabaseService<ResourceAllocation> _resources;
        private readonly IGenericSupabaseService<Institution> _institutions;

        public ProviderRequestsController(
            IGenericSupabaseService<Booking> bookings,
            IGenericSupabaseService<ResourceAllocation> resources,
            IGenericSupabaseService<Institution> institutions)
        {
            _bookings = bookings;
            _resources = resources;
            _institutions = institutions;
        }

        /// <summary>
        /// GET /api/ProviderRequests
        /// GET /api/ProviderRequests?status=Pending Payment
        ///
        /// Returns every booking request, newest first, each enriched with
        /// the equipment name and renter institution details. Pass `status`
        /// to filter (e.g. the frontend asks for "Pending Payment" to show
        /// only requests still awaiting a decision).
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<BookingRequestDto>>> GetAll([FromQuery] string? status)
        {
            var bookings = await _bookings.GetAllAsync();

            if (!string.IsNullOrWhiteSpace(status))
            {
                bookings = bookings.Where(b =>
                    string.Equals(b.Status, status, StringComparison.OrdinalIgnoreCase));
            }

            var (resourceLookup, institutionLookup) = await BuildLookupsAsync();

            var result = bookings
                .OrderByDescending(b => b.CreatedAt)
                .Select(b => ToDto(b, resourceLookup, institutionLookup))
                .ToList();

            return Ok(result);
        }

        /// <summary>GET /api/ProviderRequests/{id} - single request detail.</summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<BookingRequestDto>> GetById(string id)
        {
            var booking = await _bookings.GetByIdAsync(id);
            if (booking == null)
                return NotFound();

            var (resourceLookup, institutionLookup) = await BuildLookupsAsync();
            return Ok(ToDto(booking, resourceLookup, institutionLookup));
        }

        /// <summary>
        /// PUT /api/ProviderRequests/{id}/status
        /// Body: { "status": "Accepted" | "Rejected" | ... }
        ///
        /// This is the endpoint the Accept/Reject buttons call. Updating the
        /// booking is the primary effect; as a side effect it also keeps the
        /// equipment's own status honest:
        ///   - Accepted  -> equipment flips to "Rented".
        ///   - Rejected  -> equipment flips back to "Available" (only if it
        ///                  was "Rented" on account of *this* booking; a
        ///                  provider-initiated "Maintenance" flag is left
        ///                  alone).
        /// </summary>
        [HttpPut("{id}/status")]
        public async Task<ActionResult<BookingRequestDto>> UpdateStatus(
            string id,
            [FromBody] UpdateBookingStatusRequest request)
        {
            if (!AllowedBookingStatuses.Contains(request.Status, StringComparer.OrdinalIgnoreCase))
            {
                return BadRequest(new
                {
                    message = $"Status must be one of: {string.Join(", ", AllowedBookingStatuses)}",
                });
            }

            var booking = await _bookings.GetByIdAsync(id);
            if (booking == null)
                return NotFound();

            booking.Status = request.Status;
            var updated = await _bookings.UpdateAsync(booking) ?? booking;

            await SyncEquipmentStatusAsync(updated);

            var (resourceLookup, institutionLookup) = await BuildLookupsAsync();
            return Ok(ToDto(updated, resourceLookup, institutionLookup));
        }

        private async Task SyncEquipmentStatusAsync(Booking booking)
        {
            var resource = await _resources.GetByIdAsync(booking.ResourceId);
            if (resource == null)
                return;

            if (string.Equals(booking.Status, "Accepted", StringComparison.OrdinalIgnoreCase))
            {
                resource.Status = "Rented";
                await _resources.UpdateAsync(resource);
            }
            else if (string.Equals(booking.Status, "Rejected", StringComparison.OrdinalIgnoreCase)
                     && string.Equals(resource.Status, "Rented", StringComparison.OrdinalIgnoreCase))
            {
                resource.Status = "Available";
                await _resources.UpdateAsync(resource);
            }
        }

        private async Task<(Dictionary<string, ResourceAllocation> Resources, Dictionary<string, Institution> Institutions)>
            BuildLookupsAsync()
        {
            // Two small extra table scans per request. Fine at hackathon /
            // small-fleet scale; if the resource or institution tables grow
            // large, swap this for a Postgrest `.In("id", ids)` filter
            // scoped to just the IDs referenced by the current page of
            // bookings.
            var resources = await _resources.GetAllAsync();
            var institutions = await _institutions.GetAllAsync();

            return (
                resources.ToDictionary(r => r.Id, r => r),
                institutions.ToDictionary(i => i.Id, i => i)
            );
        }

        private static BookingRequestDto ToDto(
            Booking booking,
            IReadOnlyDictionary<string, ResourceAllocation> resourceLookup,
            IReadOnlyDictionary<string, Institution> institutionLookup)
        {
            resourceLookup.TryGetValue(booking.ResourceId, out var resource);
            institutionLookup.TryGetValue(booking.RequesterInstitutionId, out var institution);

            return new BookingRequestDto
            {
                Id = booking.Id,

                EquipmentId = booking.ResourceId,
                EquipmentName = resource?.Name ?? "Unknown Equipment",
                EquipmentCategory = resource?.Category ?? string.Empty,
                EquipmentLocation = resource?.Location ?? string.Empty,

                RequesterInstitutionId = booking.RequesterInstitutionId,
                RequesterInstitutionName = institution?.Name ?? booking.RequesterName,
                RequesterInstitutionType = institution?.Type ?? string.Empty,
                RequesterInstitutionLocation = institution?.Location ?? string.Empty,
                RequesterInstitutionVerified = institution?.Verified ?? false,
                RequesterName = booking.RequesterName,

                StartTime = booking.StartTime,
                EndTime = booking.EndTime,
                Hours = booking.Hours,

                TotalCostAlgo = booking.TotalCostAlgo,
                Purpose = booking.Purpose,

                Status = booking.Status,
                CreatedAt = booking.CreatedAt,
            };
        }
    }
}
