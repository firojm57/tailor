package org.frj.saas.tailor.service;

import org.frj.saas.tailor.dto.CustomerSuggestionDto;
import java.util.List;

public interface CustomerService {
    List<CustomerSuggestionDto> searchCustomerSuggestions(String query);
}
