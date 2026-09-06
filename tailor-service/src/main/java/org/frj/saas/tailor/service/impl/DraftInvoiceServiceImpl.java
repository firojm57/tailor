package org.frj.saas.tailor.service.impl;

import org.frj.saas.tailor.dao.DraftInvoiceDao;
import org.frj.saas.tailor.dto.bill.DraftInvoice;
import org.frj.saas.tailor.service.DraftInvoiceService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class DraftInvoiceServiceImpl implements DraftInvoiceService {

    private static final Logger log = LoggerFactory.getLogger(DraftInvoiceServiceImpl.class);

    private final DraftInvoiceDao draftInvoiceDao;

    public DraftInvoiceServiceImpl(DraftInvoiceDao draftInvoiceDao) {
        this.draftInvoiceDao = draftInvoiceDao;
    }

    @Override
    public DraftInvoice saveDraft(DraftInvoice draft) {
        if (draft.getId() == null || draft.getId().trim().isEmpty()) {
            draft.setId("draft_" + UUID.randomUUID().toString().substring(0, 8));
            log.debug("DraftInvoiceService: Generated new draftId {}", draft.getId());
        }
        draft.setUpdatedAt(LocalDateTime.now().toString());
        log.debug("DraftInvoiceService: Persisting invoice draft {}", draft.getId());
        DraftInvoice saved = draftInvoiceDao.save(draft);
        log.info("DraftInvoiceService: Invoice draft persisted with id {}", saved.getId());
        return saved;
    }

    @Override
    public Optional<DraftInvoice> getDraftById(String id) {
        log.debug("DraftInvoiceService: Querying draft by id {}", id);
        return draftInvoiceDao.findById(id);
    }

    @Override
    public void deleteDraftById(String id) {
        if (id != null && draftInvoiceDao.existsById(id)) {
            log.info("DraftInvoiceService: Removing invoice draft from DB with id {}", id);
            draftInvoiceDao.deleteById(id);
        } else {
            log.debug("DraftInvoiceService: Delete requested for non-existent draft id {}", id);
        }
    }
}
