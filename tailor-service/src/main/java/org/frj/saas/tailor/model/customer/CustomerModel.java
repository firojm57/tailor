package org.frj.saas.tailor.model.customer;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class CustomerModel {
    private long custId;
    private String name;
    private String address;
    private String mobile;
}
