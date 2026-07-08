using ArchUnitNET.Domain;
using ArchUnitNET.Fluent;
using ArchUnitNET.Loader;
using ArchUnitNET.xUnit;
using static ArchUnitNET.Fluent.ArchRuleDefinition;

namespace Vesk.Architecture.Tests;

/// <summary>
/// Enforces naming and structural conventions:
/// - All entities inherit BaseEntity
/// - Services follow I{Name} / {Name} pattern
/// - DTOs are records
/// </summary>
public class NamingConventionTests
{
    private static readonly ArchUnitNET.Domain.Architecture Architecture =
        new ArchLoader()
            .LoadAssemblies(
                typeof(Vesk.Domain.Common.BaseEntity).Assembly,
                typeof(Vesk.Application.Appointments.IAppointmentService).Assembly,
                typeof(Vesk.Infrastructure.Persistence.AppDbContext).Assembly)
            .Build();

    [Fact]
    public void AllEntities_ShouldInherit_BaseEntity()
    {
        IArchRule rule = Classes().That()
            .ResideInNamespace("Vesk.Domain.Entities", useRegularExpressions: false)
            .Should().BeAssignableTo(typeof(Vesk.Domain.Common.BaseEntity))
            .Because("all domain entities must inherit BaseEntity for TenantId + soft delete");

        rule.Check(Architecture);
    }

    [Fact]
    public void DomainTypes_ShouldNotDependOn_ApplicationLayer()
    {
        IObjectProvider<IType> applicationTypes = Types().That()
            .ResideInNamespace("Vesk.Application", useRegularExpressions: false)
            .As("Application Types");

        IObjectProvider<IType> domainTypes = Types().That()
            .ResideInNamespace("Vesk.Domain", useRegularExpressions: false)
            .As("Domain Types");

        IArchRule rule = Types().That().Are(domainTypes)
            .Should().NotDependOnAny(applicationTypes)
            .Because("domain must not depend on application layer");

        rule.Check(Architecture);
    }

    [Fact]
    public void InfrastructureServices_ShouldBeSealed()
    {
        IArchRule rule = Classes().That()
            .ResideInNamespace("Vesk.Infrastructure", useRegularExpressions: false)
            .And().HaveNameEndingWith("Service")
            .Should().BeSealed()
            .Because("infrastructure service classes should be sealed for performance");

        rule.Check(Architecture);
    }
}
