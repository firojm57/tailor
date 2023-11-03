package org.frj.saas.tailor.model.bill;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class BillingItemModel {
    private String type;
    private int quantity;
    private double rate;
    private JsonNode measurement;
}
