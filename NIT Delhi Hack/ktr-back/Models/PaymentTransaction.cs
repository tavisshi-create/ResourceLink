using Postgrest.Attributes;
using Postgrest.Models;

namespace ktr_back.Models
{
    [Table("payment_transactions")]
    public class PaymentTransaction : BaseModel
    {
        [PrimaryKey("id", false)]
        public string Id { get; set; } = string.Empty;

        [Column("booking_id")]
        public string BookingId { get; set; } = string.Empty;

        [Column("tx_id")]
        public string TxId { get; set; } = string.Empty;

        [Column("sender_address")]
        public string SenderAddress { get; set; } = string.Empty;

        [Column("receiver_address")]
        public string ReceiverAddress { get; set; } = string.Empty;

        [Column("amount_algo")]
        public decimal AmountAlgo { get; set; }

        [Column("amount_micro_algo")]
        public long AmountMicroAlgo { get; set; }

        [Column("status")]
        public string Status { get; set; } = "Confirmed";

        [Column("block_round")]
        public long? BlockRound { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}