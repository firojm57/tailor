package org.frj.saas.tailor.dto.bill;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.frj.saas.tailor.dto.customer.CustomerDto;

import java.sql.Date;
import java.util.List;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class BillDetailDto {
    private String billId;
    private Date billDate;
    private Date dueDate;
    private double paidAmount;
    private double pendingAmount;
    private CustomerDto customer;
    @Setter
    private List<BillingItemDto> billingItems;
}