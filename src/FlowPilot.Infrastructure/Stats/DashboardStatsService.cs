using FlowPilot.Application.Stats;
using FlowPilot.Domain.Enums;
using FlowPilot.Infrastructure.Persistence;
using FlowPilot.Shared;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace FlowPilot.Infrastructure.Stats;

/// <summary>
/// Computes dashboard KPIs from appointment and messaging data.
/// </summary>
public sealed class DashboardStatsService : IDashboardStatsService
{
    private readonly AppDbContext _db;
    private readonly TimeSpan _atRiskWindow;

    public DashboardStatsService(AppDbContext db, IConfiguration configuration)
    {
        _db = db;

        // Mirror AppointmentLifecycleWorker's window resolution so the dashboard KPI and the
        // worker agree on what "at risk" means. Minutes override wins (local test runs);
        // otherwise fall back to hours (prod default 3h). Read via the indexer + TryParse to avoid
        // taking a dependency on the Configuration.Binder extension package in this project.
        _atRiskWindow = int.TryParse(configuration["Appointments:AtRiskWindowMinutes"], out int atRiskMinutes)
            ? TimeSpan.FromMinutes(atRiskMinutes)
            : TimeSpan.FromHours(int.TryParse(configuration["Appointments:AtRiskWindowHours"], out int atRiskHours) ? atRiskHours : 3);
    }

    /// <inheritdoc />
    public async Task<Result<DashboardStatsDto>> GetDashboardStatsAsync(CancellationToken cancellationToken = default)
    {
        DateTime utcNow = DateTime.UtcNow;
        DateTime thirtyDaysAgo = utcNow.AddDays(-30);
        int currentYear = utcNow.Year;
        int currentMonth = utcNow.Month;

        // No-show rate: Missed / (Completed + Missed + Cancelled) over last 30 days
        // Only count terminal appointment states to get a meaningful rate
        var appointmentCounts = await _db.Appointments
            .AsNoTracking()
            .Where(a => a.StartsAt >= thirtyDaysAgo && a.StartsAt <= utcNow)
            .GroupBy(_ => 1)
            .Select(g => new
            {
                Total = g.Count(),
                Missed = g.Count(a => a.Status == AppointmentStatus.Missed)
            })
            .FirstOrDefaultAsync(cancellationToken);

        int totalAppointments = appointmentCounts?.Total ?? 0;
        int missedAppointments = appointmentCounts?.Missed ?? 0;
        decimal noShowRate = totalAppointments > 0
            ? Math.Round((decimal)missedAppointments / totalAppointments * 100, 1)
            : 0;

        // Review SMS sent this month: count outbound messages that contain review-related content
        // We track via AgentRun with type "ReviewRecovery" that completed successfully
        int reviewsSent = await _db.AgentRuns
            .AsNoTracking()
            .Where(r => r.AgentType == "ReviewRecovery"
                        && r.Status == "Completed"
                        && r.StartedAt.Year == currentYear
                        && r.StartedAt.Month == currentMonth)
            .CountAsync(cancellationToken);

        // Total SMS sent this month from UsageRecord
        int smsSent = await _db.UsageRecords
            .AsNoTracking()
            .Where(u => u.Year == currentYear && u.Month == currentMonth)
            .Select(u => u.SmsSent)
            .FirstOrDefaultAsync(cancellationToken);

        // At-risk: Scheduled appointments that are either (a) already flagged by the lifecycle worker,
        // or (b) inside the upcoming at-risk window right now. Counting (b) directly means freshly
        // created near-term unconfirmed appointments reflect immediately, before the worker's next
        // scan fires — otherwise the KPI reads 0 until the background scan runs.
        // We keep (a) so an appointment the worker already flagged stays counted even after its
        // StartsAt passes (until the lifecycle worker transitions it to Missed); relying on the
        // window alone would make the KPI drop to 0 in that gap.
        DateTime atRiskWindowEnd = utcNow + _atRiskWindow;
        int atRiskCount = await _db.Appointments
            .AsNoTracking()
            .CountAsync(a => a.Status == AppointmentStatus.Scheduled
                             && (a.AtRiskAlertedAt != null
                                 || (a.StartsAt > utcNow && a.StartsAt <= atRiskWindowEnd)),
                        cancellationToken);

        return Result.Success(new DashboardStatsDto(
            NoShowRatePercent: noShowRate,
            TotalAppointmentsLast30Days: totalAppointments,
            MissedAppointmentsLast30Days: missedAppointments,
            ReviewsSentThisMonth: reviewsSent,
            SmsSentThisMonth: smsSent,
            AtRiskCount: atRiskCount));
    }
}
