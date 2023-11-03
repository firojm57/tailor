package org.frj.saas.tailor.model.bill;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class BillingModel {
    private String billId;
    private long custId;
    private String custName;
    private String custMobile;
}
