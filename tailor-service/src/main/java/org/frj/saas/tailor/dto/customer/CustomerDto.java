package org.frj.saas.tailor.dto.customer;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class CustomerDto {
    private long custId;
    private String name;
    private String address;
    private String mobile;
}
