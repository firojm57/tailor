package org.frj.saas.tailor.model.bill;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.frj.saas.tailor.model.customer.CustomerModel;

import java.sql.Date;
import java.util.List;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class BillDetailModel {
    private String billId;
    private Date billDate;
    private Date dueDate;
    private double paidAmount;
    private double pendingAmount;
    private CustomerModel customer;
    @Setter
    private List<BillingItemModel> billingItems;
}
