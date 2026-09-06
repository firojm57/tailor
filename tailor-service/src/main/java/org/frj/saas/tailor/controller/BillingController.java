package org.frj.saas.tailor.controller;

import org.frj.saas.tailor.dto.PagedResponse;
import org.frj.saas.tailor.dto.bill.BillDto;
import org.frj.saas.tailor.service.BillingService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/billing")
public class BillingController {

    private static final Logger log = LoggerFactory.getLogger(BillingController.class);

    private final BillingService billingService;

    public BillingController(BillingService billingService) {
        this.billingService = billingService;
    }

    @GetMapping
    public ResponseEntity<PagedResponse<BillDto>> getBills(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @RequestParam(value = "search", defaultValue = "") String search
    ) {
        log.debug("Fetching bills page={}, size={}, search='{}'", page, size, search);
        Page<BillDto> result = billingService.getFilteredBills(search, PageRequest.of(page, size));
        PagedResponse<BillDto> response = new PagedResponse<>(
                result.getContent(),
                result.getNumber(),
                result.getSize(),
                result.getTotalElements(),
                result.getTotalPages(),
                result.isLast()
        );
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<BillDto> createBill(@RequestBody BillDto bill) {
        log.debug("Creating new bill for customer: {}, mobile: {}", bill.getCustomerName(), bill.getMobileNumber());
        BillDto saved = billingService.saveBill(bill);
        log.info("Bill created successfully with billNumber: {}, id: {}", saved.getBillNumber(), saved.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<BillDto> updateBill(@PathVariable Long id, @RequestBody BillDto bill) {
        log.debug("Updating bill id: {}", id);
        bill.setId(id);
        BillDto updated = billingService.saveBill(bill);
        log.info("Bill updated successfully with id: {}", id);
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/{id}/paid")
    public ResponseEntity<BillDto> togglePaidStatus(@PathVariable Long id) {
        log.debug("Toggling payment status for bill id: {}", id);
        return billingService.getById(id).map(bill -> {
            bill.setPaid(!Boolean.TRUE.equals(bill.getPaid()));
            BillDto updated = billingService.saveBill(bill);
            log.info("Bill payment status updated to paid={} for bill id: {}", updated.getPaid(), id);
            return ResponseEntity.ok(updated);
        }).orElseGet(() -> {
            log.warn("Attempted to toggle payment status for non-existent bill id: {}", id);
            return ResponseEntity.notFound().build();
        });
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBill(@PathVariable Long id) {
        log.debug("Deleting bill with id: {}", id);
        billingService.deleteById(id);
        log.info("Bill deleted successfully with id: {}", id);
        return ResponseEntity.noContent().build();
    }
}
