package org.frj.saas.tailor.dto;

public class BillingDto {
    private String billId;
    private long custId;
    private String custName;
    private String custMobile;

    public BillingDto() {}

    public BillingDto(String billId, long custId, String custName, String custMobile) {
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
