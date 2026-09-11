namespace ktr_back.Models.Dtos
{
    /// <summary>
    /// Read model for the provider-facing "Requests &amp; Notifications" panel.
    /// A raw <see cref="Booking"/> row only stores foreign keys
    /// (resource_id, requester_institution_id), which isn't enough to render
    /// a useful notification card - the provider needs the equipment name
    /// and the renter institution's details too. This DTO flattens all of
    /// that into a single shape so the frontend doesn't have to stitch
    /// together three separate API calls.
    /// </summary>
    public class BookingRequestDto
    {
        public string Id { get; set; } = string.Empty;

        // Equipment being requested.
        public string EquipmentId { get; set; } = string.Empty;
        public string EquipmentName { get; set; } = string.Empty;
        public string EquipmentCategory { get; set; } = string.Empty;
        public string EquipmentLocation { get; set; } = string.Empty;

        // Renter / institution making the request.
        public string RequesterInstitutionId { get; set; } = string.Empty;
        public string RequesterInstitutionName { get; set; } = string.Empty;
        public string RequesterInstitutionType { get; set; } = string.Empty;
        public string RequesterInstitutionLocation { get; set; } = string.Empty;
        public bool RequesterInstitutionVerified { get; set; }
        public string RequesterName { get; set; } = string.Empty;

        // Requested time slot.
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public decimal Hours { get; set; }

        // Cost + rationale.
        public decimal TotalCostAlgo { get; set; }
        public string Purpose { get; set; } = string.Empty;

        // Lifecycle.
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }

    /// <summary>Request body for PUT /api/ProviderRequests/{id}/status.</summary>
    public class UpdateBookingStatusRequest
    {
        public string Status { get; set; } = string.Empty;
    }

    /// <summary>Request body for PATCH /api/ResourceAllocations/{id}/status.</summary>
    public class UpdateEquipmentStatusRequest
    {
        public string Status { get; set; } = string.Empty;
    }
}
