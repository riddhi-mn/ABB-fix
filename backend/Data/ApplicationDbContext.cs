using IntelliInspect.API.Models;
using Microsoft.EntityFrameworkCore;

namespace IntelliInspect.API.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<DatasetRecord> DatasetRecords { get; set; }
    public DbSet<ModelTraining> ModelTrainings { get; set; }
    public DbSet<SimulationSession> SimulationSessions { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<DatasetRecord>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.SyntheticTimestamp);
        });

        modelBuilder.Entity<ModelTraining>(entity =>
        {
            entity.HasKey(e => e.Id);
        });

        modelBuilder.Entity<SimulationSession>(entity =>
        {
            entity.HasKey(e => e.Id);
        });
    }
}

