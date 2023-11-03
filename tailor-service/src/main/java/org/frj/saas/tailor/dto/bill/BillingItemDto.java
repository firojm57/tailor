package org.frj.saas.tailor.dto.bill;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class BillingItemDto {
    private String type;
    private int quantity;
    private double rate;
    private String measurement;
}
