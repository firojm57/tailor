package org.frj.saas.tailor.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import org.frj.saas.tailor.model.bill.BillDetailModel;
import org.frj.saas.tailor.model.bill.BillingModel;
import org.frj.saas.tailor.service.BillingService;
import org.frj.saas.tailor.util.Constants;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@CrossOrigin(originPatterns = "*")
@RestController
public class BillingController {

    @Autowired
    private BillingService service;

    @GetMapping(Constants.BILLING_ENDPOINT)
    public ResponseEntity<?> getAllBills() {
        List<BillingModel> bills = service.getAllBills();
        return ResponseEntity.ok(bills);
    }

    @GetMapping(Constants.BILLING_BILLID_ENDPOINT)
    public ResponseEntity<?> getBillById(@PathVariable String billId) {
        BillDetailModel billDetail;
        try {
            billDetail = service.getBillDetailById(billId);
        } catch (JsonProcessingException ex) {
            return ResponseEntity.internalServerError().build();
        }
        if (billDetail == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        return ResponseEntity.ok(billDetail);
    }
}
