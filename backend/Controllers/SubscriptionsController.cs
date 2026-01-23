using System.Security.Claims;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

using MinhasAssinaturas.Api.Data;
using MinhasAssinaturas.Models;

namespace MinhasAssinaturas.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SubscriptionsController : ControllerBase
{
    private readonly AppDbContext _db;

    public SubscriptionsController(AppDbContext db)
    {
        _db = db;
    }

    private string GetUserId()
    {
        return User.FindFirstValue(ClaimTypes.NameIdentifier)
               ?? throw new UnauthorizedAccessException("UserId não encontrado no token.");
    }

    // DTOs
    public record SubscriptionDto(
        Guid Id,
        string ServiceName,
        decimal Amount,
        int BillingDay
    );

    public record CreateSubscriptionRequest(
        string ServiceName,
        decimal Amount,
        int BillingDay
    );

    public record UpdateSubscriptionRequest(
        string ServiceName,
        decimal Amount,
        int BillingDay
    );

    // GET /api/subscriptions
    [HttpGet]
    public async Task<ActionResult<List<SubscriptionDto>>> GetAll()
    {
        var userId = GetUserId();

        var subscriptions = await _db.Subscriptions
            .Where(s => s.UserId == userId)
            .OrderBy(s => s.BillingDay)
            .Select(s => new SubscriptionDto(
                s.Id,
                s.ServiceName,
                s.Amount,
                s.BillingDay
            ))
            .ToListAsync();

        return Ok(subscriptions);
    }

    // POST /api/subscriptions
    [HttpPost]
    public async Task<ActionResult<SubscriptionDto>> Create(
        [FromBody] CreateSubscriptionRequest request
    )
    {
        var userId = GetUserId();

        var subscription = new Subscription
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            ServiceName = request.ServiceName.Trim(),
            Amount = request.Amount,
            BillingDay = request.BillingDay,
            CreatedAtUtc = DateTime.UtcNow
        };

        _db.Subscriptions.Add(subscription);
        await _db.SaveChangesAsync();

        var dto = new SubscriptionDto(
            subscription.Id,
            subscription.ServiceName,
            subscription.Amount,
            subscription.BillingDay
        );

        return Ok(dto);
    }

    // PUT /api/subscriptions/{id}
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(
        Guid id,
        [FromBody] UpdateSubscriptionRequest request
    )
    {
        var userId = GetUserId();

        var subscription = await _db.Subscriptions
            .FirstOrDefaultAsync(s => s.Id == id && s.UserId == userId);

        if (subscription == null)
            return NotFound();

        subscription.ServiceName = request.ServiceName.Trim();
        subscription.Amount = request.Amount;
        subscription.BillingDay = request.BillingDay;

        await _db.SaveChangesAsync();
        return NoContent();
    }

    // DELETE /api/subscriptions/{id}
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var userId = GetUserId();

        var subscription = await _db.Subscriptions
            .FirstOrDefaultAsync(s => s.Id == id && s.UserId == userId);

        if (subscription == null)
            return NotFound();

        _db.Subscriptions.Remove(subscription);
        await _db.SaveChangesAsync();

        return NoContent();
    }
}
