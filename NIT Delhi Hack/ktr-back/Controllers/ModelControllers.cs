using ktr_back.Models;
using ktr_back.Models.Dtos;
using ktr_back.Services;
using Microsoft.AspNetCore.Mvc;

namespace ktr_back.Controllers
{
    public class AccessGrantsController : BaseCrudController<AccessGrant>
    {
        public AccessGrantsController(IGenericSupabaseService<AccessGrant> service) : base(service) { }
    }
    
    public class BookingsController : BaseCrudController<Booking>
    {
        public BookingsController(IGenericSupabaseService<Booking> service) : base(service) { }
    }
    
    public class EscrowAccountsController : BaseCrudController<EscrowAccount>
    {
        public EscrowAccountsController(IGenericSupabaseService<EscrowAccount> service) : base(service) { }
    }
    
    public class InstitutionsController : BaseCrudController<Institution>
    {
        public InstitutionsController(IGenericSupabaseService<Institution> service) : base(service) { }
    }
    
    public class PaymentTransactionsController : BaseCrudController<PaymentTransaction>
    {
        public PaymentTransactionsController(IGenericSupabaseService<PaymentTransaction> service) : base(service) { }
    }
    
    public class ResourceAllocationsController : BaseCrudController<ResourceAllocation>
    {
        private static readonly string[] AllowedStatuses = { "Available", "Rented", "Maintenance" };

        public ResourceAllocationsController(IGenericSupabaseService<ResourceAllocation> service) : base(service) { }

        /// <summary>
        /// PATCH /api/ResourceAllocations/{id}/status
        /// Body: { "status": "Available" | "Rented" | "Maintenance" }
        ///
        /// Dedicated status-only endpoint for the inventory panel's instant
        /// toggle - lets the frontend flip a single field without having to
        /// round-trip (and risk clobbering) the entire equipment record via
        /// the generic PUT above.
        /// </summary>
        [HttpPatch("{id}/status")]
        public async Task<ActionResult<ResourceAllocation>> UpdateStatus(
            string id,
            [FromBody] UpdateEquipmentStatusRequest request)
        {
            if (!AllowedStatuses.Contains(request.Status, StringComparer.OrdinalIgnoreCase))
            {
                return BadRequest(new
                {
                    message = $"Status must be one of: {string.Join(", ", AllowedStatuses)}",
                });
            }

            var item = await _service.GetByIdAsync(id);
            if (item == null)
                return NotFound();

            item.Status = request.Status;
            var updated = await _service.UpdateAsync(item);
            return Ok(updated);
        }
    }
}
