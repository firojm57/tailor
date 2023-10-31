package org.frj.saas.tailor.controller;

import org.frj.saas.tailor.model.BillingModel;
import org.frj.saas.tailor.service.BillingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@CrossOrigin(originPatterns = "*")
@RestController
public class BillingController {

    @Autowired
    private BillingService service;

    @GetMapping("/bills")
    public ResponseEntity<?> getAllBills() {
        List<BillingModel> bills = service.getAllBills();
        return ResponseEntity.ok(bills);
    }
}
