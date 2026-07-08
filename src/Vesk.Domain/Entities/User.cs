using Vesk.Domain.Common;
using Vesk.Domain.Enums;

namespace Vesk.Domain.Entities;

/// <summary>
/// Application user belonging to a tenant. Roles: Owner, Manager, Staff.
/// </summary>
public class User : BaseEntity
{
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public UserRole Role { get; set; }
    public string? RefreshToken { get; set; }
    public DateTime? RefreshTokenExpiresAt { get; set; }

    public Tenant Tenant { get; set; } = null!;
}
