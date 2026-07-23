package org.frj.saas.tailor.controller;

import org.frj.saas.tailor.dto.PagedResponse;
import org.frj.saas.tailor.dto.bill.BillDto;
import org.frj.saas.tailor.service.BillingService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/billing")
public class BillingController {

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
        BillDto saved = billingService.saveBill(bill);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<BillDto> updateBill(@PathVariable Long id, @RequestBody BillDto bill) {
        bill.setId(id);
        BillDto updated = billingService.saveBill(bill);
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/{id}/paid")
    public ResponseEntity<BillDto> togglePaidStatus(@PathVariable Long id) {
        return billingService.getById(id).map(bill -> {
            bill.setPaid(!Boolean.TRUE.equals(bill.getPaid()));
            BillDto updated = billingService.saveBill(bill);
            return ResponseEntity.ok(updated);
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBill(@PathVariable Long id) {
        billingService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
