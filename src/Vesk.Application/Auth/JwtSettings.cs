namespace Vesk.Application.Auth;

/// <summary>
/// Configuration for JWT token generation bound from appsettings Jwt section.
/// </summary>
public sealed class JwtSettings
{
    public const string SectionName = "Jwt";

    public string Secret { get; set; } = string.Empty;
    public string Issuer { get; set; } = "Vesk";
    public string Audience { get; set; } = "Vesk";
    public int AccessTokenExpirationMinutes { get; set; } = 30;
    public int RefreshTokenExpirationDays { get; set; } = 7;
}
