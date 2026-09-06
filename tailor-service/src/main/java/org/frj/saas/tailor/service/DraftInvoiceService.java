package org.frj.saas.tailor.service;

import org.frj.saas.tailor.dto.bill.DraftInvoice;

import java.util.Optional;

public interface DraftInvoiceService {
    DraftInvoice saveDraft(DraftInvoice draft);
    Optional<DraftInvoice> getDraftById(String id);
    void deleteDraftById(String id);
}
