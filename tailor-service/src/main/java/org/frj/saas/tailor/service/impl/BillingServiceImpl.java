package org.frj.saas.tailor.service.impl;

import org.frj.saas.tailor.dao.BillDao;
import org.frj.saas.tailor.dto.bill.BillDto;
import org.frj.saas.tailor.service.BillingService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class BillingServiceImpl implements BillingService {

    private static final Logger log = LoggerFactory.getLogger(BillingServiceImpl.class);

    private final BillDao billDao;

    public BillingServiceImpl(BillDao billDao) {
        this.billDao = billDao;
    }

    @Override
    public List<BillDto> getAllBills() {
        log.debug("BillingService: Querying all bills from DB ordered by ID desc");
        return billDao.findAllByOrderByIdDesc();
    }

    @Override
    public Page<BillDto> getFilteredBills(String search, Pageable pageable) {
        String searchTerm = search == null ? "" : search.trim();
        log.debug("BillingService: Querying filtered bills with term '{}'", searchTerm);
        return billDao.findFiltered(searchTerm, pageable);
    }

    @Override
    public BillDto saveBill(BillDto bill) {
        if (bill.getBillNumber() == null || bill.getBillNumber().trim().isEmpty()) {
            bill.setBillNumber("INV-" + (System.currentTimeMillis() / 1000));
        }
        log.debug("BillingService: Saving bill entity for customer {}", bill.getCustomerName());
        BillDto saved = billDao.save(bill);
        log.info("BillingService: Persisted bill id: {}, billNumber: {}", saved.getId(), saved.getBillNumber());
        return saved;
    }

    @Override
    public Optional<BillDto> getById(Long id) {
        log.debug("BillingService: Fetching bill by id {}", id);
        return billDao.findById(id);
    }

    @Override
    public void deleteById(Long id) {
        log.info("BillingService: Removing bill record from DB with id {}", id);
        billDao.deleteById(id);
    }
}
