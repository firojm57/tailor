package org.frj.saas.tailor.model;

import java.sql.Date;

public class BillingModel {
    private String billId;
    private Date billDate;
    private Date dueDate;
    private double paidAmount;
    private double pendingAmount;
    private long custId;
    private int quantity;
    private double rate;

    public BillingModel() {}

    public BillingModel(String billId, Date billDate, Date dueDate, double paidAmount, double pendingAmount, long custId, int quantity, double rate) {
        this.billId = billId;
        this.billDate = billDate;
        this.dueDate = dueDate;
        this.paidAmount = paidAmount;
        this.pendingAmount = pendingAmount;
        this.custId = custId;
        this.quantity = quantity;
        this.rate = rate;
    }

    public String getBillId() {
        return billId;
    }

    public Date getBillDate() {
        return billDate;
    }

    public Date getDueDate() {
        return dueDate;
    }

    public double getPaidAmount() {
        return paidAmount;
    }

    public double getPendingAmount() {
        return pendingAmount;
    }

    public long getCustId() {
        return custId;
    }

    public int getQuantity() {
        return quantity;
    }

    public double getRate() {
        return rate;
    }
}
