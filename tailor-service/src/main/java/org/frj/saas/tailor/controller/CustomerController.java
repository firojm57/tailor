package org.frj.saas.tailor.controller;

import org.frj.saas.tailor.dto.CustomerSuggestionDto;
import org.frj.saas.tailor.service.CustomerService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/customers")
public class CustomerController {

    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    @GetMapping("/search")
    public ResponseEntity<List<CustomerSuggestionDto>> searchCustomerSuggestions(@RequestParam("query") String query) {
        return ResponseEntity.ok(customerService.searchCustomerSuggestions(query));
    }
}
