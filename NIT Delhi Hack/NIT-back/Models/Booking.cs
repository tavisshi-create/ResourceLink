using Postgrest.Attributes;
using Postgrest.Models;

namespace ktr_back.Models
{
    [Table("bookings")]
    public class Booking : BaseModel
    {
        [PrimaryKey("id", false)]
        public string Id { get; set; } = string.Empty;

        [Column("resource_id")]
        public string ResourceId { get; set; } = string.Empty;

        [Column("requester_institution_id")]
        public string RequesterInstitutionId { get; set; } = string.Empty;

        [Column("requester_name")]
        public string RequesterName { get; set; } = string.Empty;

        [Column("start_time")]
        public DateTime StartTime { get; set; }

        [Column("end_time")]
        public DateTime EndTime { get; set; }

        [Column("hours")]
        public decimal Hours { get; set; }

        [Column("total_cost_algo")]
        public decimal TotalCostAlgo { get; set; }

        // Free-text reason the renter gave for the request (e.g. "Semester
        // research project on protein folding"). Shown to the provider on
        // the Requests & Notifications panel so they can make an informed
        // accept/reject decision.
        [Column("purpose")]
        public string Purpose { get; set; } = string.Empty;

        [Column("status")]
        public string Status { get; set; } = "Pending Payment";

        [Column("payment_transaction_id")]
        public string? PaymentTransactionId { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}