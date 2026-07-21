package org.frj.saas.tailor.dto;

public class DashboardStatsDto {
    private long totalCustomers;
    private double totalEarnings;
    private long totalMeasurements;
    private long totalBills;

    public DashboardStatsDto() {}

    public DashboardStatsDto(long totalCustomers, double totalEarnings, long totalMeasurements, long totalBills) {
        this.totalCustomers = totalCustomers;
        this.totalEarnings = totalEarnings;
        this.totalMeasurements = totalMeasurements;
        this.totalBills = totalBills;
    }

    public long getTotalCustomers() { return totalCustomers; }
    public void setTotalCustomers(long totalCustomers) { this.totalCustomers = totalCustomers; }

    public double getTotalEarnings() { return totalEarnings; }
    public void setTotalEarnings(double totalEarnings) { this.totalEarnings = totalEarnings; }

    public long getTotalMeasurements() { return totalMeasurements; }
    public void setTotalMeasurements(long totalMeasurements) { this.totalMeasurements = totalMeasurements; }

    public long getTotalBills() { return totalBills; }
    public void setTotalBills(long totalBills) { this.totalBills = totalBills; }
}
