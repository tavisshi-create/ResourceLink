using Postgrest.Attributes;
using Postgrest.Models;

namespace ktr_back.Models
{
    [Table("escrow_accounts")]
    public class EscrowAccount : BaseModel
    {
        [PrimaryKey("id", false)]
        public string Id { get; set; } = string.Empty;

        [Column("booking_id")]
        public string BookingId { get; set; } = string.Empty;

        [Column("escrow_address")]
        public string EscrowAddress { get; set; } = string.Empty;

        [Column("locked_amount_algo")]
        public decimal LockedAmountAlgo { get; set; }

        [Column("is_released")]
        public bool IsReleased { get; set; }

        [Column("is_refunded")]
        public bool IsRefunded { get; set; }

        [Column("release_tx_id")]
        public string? ReleaseTxId { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}