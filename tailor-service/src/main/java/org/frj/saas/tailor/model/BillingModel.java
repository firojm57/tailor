package org.frj.saas.tailor.model;

public class BillingModel {
    private String billId;
    private long custId;
    private String custName;
    private String custMobile;

    public BillingModel() {}

    public BillingModel(String billId, long custId, String custName, String custMobile) {
        this.billId = billId;
        this.custId = custId;
        this.custName = custName;
        this.custMobile = custMobile;
    }

    public String getBillId() {
        return billId;
    }

    public long getCustId() {
        return custId;
    }

    public String getCustName() {
        return custName;
    }

    public String getCustMobile() {
        return custMobile;
    }
}
