using Postgrest.Attributes;
using Postgrest.Models;

namespace ktr_back.Models
{
    [Table("resource_allocations")]
    public class ResourceAllocation : BaseModel
    {
        [PrimaryKey("id", false)]
        public string Id { get; set; } = string.Empty;

        [Column("name")]
        public string Name { get; set; } = string.Empty;

        [Column("category")]
        public string Category { get; set; } = string.Empty;

        [Column("institution")]
        public string Institution { get; set; } = string.Empty;

        [Column("location")]
        public string Location { get; set; } = string.Empty;

        [Column("rate_per_hour")]
        public decimal RatePerHour { get; set; }

        [Column("total_cost_algo")]
        public decimal TotalCostAlgo { get; set; }

        [Column("status")]
        public string Status { get; set; } = "Pending Verification";

        [Column("request_date")]
        public string RequestDate { get; set; } = string.Empty;

        [Column("scheduled_slot")]
        public string ScheduledSlot { get; set; } = string.Empty;

        [Column("operator_required")]
        public bool OperatorRequired { get; set; }

        [Column("notes")]
        public string Notes { get; set; } = string.Empty;

        [Column("images")]
        public List<string> Images { get; set; } = new();

        [Column("specs")]
        public Dictionary<string, string> Specs { get; set; } = new();
    }
}