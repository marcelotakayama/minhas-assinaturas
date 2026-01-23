using System.Reflection;

using static System.Runtime.InteropServices.JavaScript.JSType;

using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using MinhasAssinaturas.Models;

namespace MinhasAssinaturas.Api.Data;

public class AppDbContext : IdentityDbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Subscription> Subscriptions => Set<Subscription>();
}