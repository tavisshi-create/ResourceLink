using Postgrest.Attributes;
using Postgrest.Models;

namespace ktr_back.Models
{
    [Table("access_grants")]
    public class AccessGrant : BaseModel
    {
        [PrimaryKey("id", false)]
        public string Id { get; set; } = string.Empty;

        [Column("booking_id")]
        public string BookingId { get; set; } = string.Empty;

        [Column("resource_id")]
        public string ResourceId { get; set; } = string.Empty;

        [Column("requester_institution_id")]
        public string RequesterInstitutionId { get; set; } = string.Empty;

        [Column("access_token")]
        public string AccessToken { get; set; } = string.Empty;

        [Column("valid_from")]
        public DateTime ValidFrom { get; set; }

        [Column("valid_until")]
        public DateTime ValidUntil { get; set; }

        [Column("status")]
        public string Status { get; set; } = "Active";

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}