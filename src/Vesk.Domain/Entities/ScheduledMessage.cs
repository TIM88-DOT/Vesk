using Vesk.Domain.Common;
using Vesk.Domain.Enums;

namespace Vesk.Domain.Entities;

/// <summary>
/// A message scheduled for future delivery via Azure Service Bus deferred messages.
/// ServiceBusSequenceNumber is required for cancellation.
/// </summary>
public class ScheduledMessage : BaseEntity
{
    public Guid AppointmentId { get; set; }
    public Guid CustomerId { get; set; }
    public Guid? TemplateId { get; set; }
    public ScheduledMessageStatus Status { get; set; } = ScheduledMessageStatus.Pending;
    public DateTime ScheduledAt { get; set; }
    public DateTime? SentAt { get; set; }
    public string? RenderedBody { get; set; }
    public string? Locale { get; set; }
    public long? ServiceBusSequenceNumber { get; set; }

    public Appointment Appointment { get; set; } = null!;
    public Customer Customer { get; set; } = null!;
    public Template? Template { get; set; }
}
