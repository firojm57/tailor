package org.frj.saas.tailor.dto.bill;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class BillingDto {
    private String billId;
    private long custId;
    private String custName;
    private String custMobile;
}
