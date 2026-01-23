using System.ComponentModel.DataAnnotations;

namespace MinhasAssinaturas.Models;

public class Subscription
{
    public Guid Id { get; set; }

    [Required]
    public string UserId { get; set; } = default!; // IdentityUser.Id

    [Required, MaxLength(120)]
    public string ServiceName { get; set; } = default!;

    [Range(0.01, 999999)]
    public decimal Amount { get; set; }

    [Range(1, 31)]
    public int BillingDay { get; set; } // dia do mês

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}
