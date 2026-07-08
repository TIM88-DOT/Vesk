using ArchUnitNET.Domain;
using ArchUnitNET.Fluent;
using ArchUnitNET.Loader;
using ArchUnitNET.xUnit;
using static ArchUnitNET.Fluent.ArchRuleDefinition;

namespace Vesk.Architecture.Tests;

/// <summary>
/// Enforces bounded context isolation: Infrastructure modules must not directly
/// reference another module's DbContext or service. Cross-module communication
/// must go through domain events (MediatR) or integration events (Service Bus).
/// </summary>
public class BoundedContextTests
{
    private static readonly ArchUnitNET.Domain.Architecture Architecture =
        new ArchLoader()
            .LoadAssemblies(
                typeof(Vesk.Infrastructure.Persistence.AppDbContext).Assembly)
            .Build();

    [Theory]
    [InlineData("Vesk.Infrastructure.Appointments", "Vesk.Infrastructure.Customers")]
    [InlineData("Vesk.Infrastructure.Appointments", "Vesk.Infrastructure.Messaging")]
    [InlineData("Vesk.Infrastructure.Appointments", "Vesk.Infrastructure.Templates")]
    [InlineData("Vesk.Infrastructure.Customers", "Vesk.Infrastructure.Appointments")]
    [InlineData("Vesk.Infrastructure.Customers", "Vesk.Infrastructure.Messaging")]
    [InlineData("Vesk.Infrastructure.Customers", "Vesk.Infrastructure.Templates")]
    [InlineData("Vesk.Infrastructure.Messaging", "Vesk.Infrastructure.Appointments")]
    [InlineData("Vesk.Infrastructure.Messaging", "Vesk.Infrastructure.Customers")]
    [InlineData("Vesk.Infrastructure.Services", "Vesk.Infrastructure.Appointments")]
    [InlineData("Vesk.Infrastructure.Services", "Vesk.Infrastructure.Customers")]
    [InlineData("Vesk.Infrastructure.Services", "Vesk.Infrastructure.Messaging")]
    [InlineData("Vesk.Infrastructure.Settings", "Vesk.Infrastructure.Appointments")]
    [InlineData("Vesk.Infrastructure.Settings", "Vesk.Infrastructure.Customers")]
    [InlineData("Vesk.Infrastructure.Settings", "Vesk.Infrastructure.Messaging")]
    public void InfrastructureModule_ShouldNotDirectlyReference_AnotherModule(string sourceNs, string targetNs)
    {
        IObjectProvider<IType> source = Types().That()
            .ResideInNamespace(sourceNs, useRegularExpressions: false)
            .As($"{sourceNs}");

        IObjectProvider<IType> target = Types().That()
            .ResideInNamespace(targetNs, useRegularExpressions: false)
            .As($"{targetNs}");

        IArchRule rule = Types().That().Are(source)
            .Should().NotDependOnAny(target)
            .Because("bounded contexts must communicate via domain events, not direct references");

        rule.Check(Architecture);
    }
}
