package org.frj.saas.tailor.controller;

import org.frj.saas.tailor.dto.bill.DraftInvoice;
import org.frj.saas.tailor.service.DraftInvoiceService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/drafts")
public class DraftInvoiceController {

    private static final Logger log = LoggerFactory.getLogger(DraftInvoiceController.class);

    private final DraftInvoiceService draftInvoiceService;

    public DraftInvoiceController(DraftInvoiceService draftInvoiceService) {
        this.draftInvoiceService = draftInvoiceService;
    }

    @PostMapping
    public ResponseEntity<DraftInvoice> saveDraft(@RequestBody DraftInvoice draft) {
        log.debug("Auto-saving draft invoice for customer: {}", draft.getCustomerName());
        DraftInvoice saved = draftInvoiceService.saveDraft(draft);
        log.info("Invoice draft auto-saved with draftId: {}", saved.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DraftInvoice> getDraft(@PathVariable String id) {
        log.debug("Fetching invoice draft with id: {}", id);
        return draftInvoiceService.getDraftById(id)
                .map(draft -> {
                    log.info("Found invoice draft for id: {}", id);
                    return ResponseEntity.ok(draft);
                })
                .orElseGet(() -> {
                    log.info("Invoice draft not found for id: {}", id);
                    return ResponseEntity.notFound().build();
                });
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDraft(@PathVariable String id) {
        log.debug("Deleting invoice draft with id: {}", id);
        draftInvoiceService.deleteDraftById(id);
        log.info("Invoice draft deleted with id: {}", id);
        return ResponseEntity.noContent().build();
    }
}
