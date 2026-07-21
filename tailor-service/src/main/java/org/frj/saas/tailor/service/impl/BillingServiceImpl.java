package org.frj.saas.tailor.service.impl;

import org.frj.saas.tailor.dao.BillDao;
import org.frj.saas.tailor.dto.bill.BillDto;
import org.frj.saas.tailor.service.BillingService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class BillingServiceImpl implements BillingService {

    private final BillDao billDao;

    public BillingServiceImpl(BillDao billDao) {
        this.billDao = billDao;
    }

    @Override
    public List<BillDto> getAllBills() {
        return billDao.findAllByOrderByIdDesc();
    }

    @Override
    public BillDto saveBill(BillDto bill) {
        return billDao.save(bill);
    }

    @Override
    public Optional<BillDto> getById(Long id) {
        return billDao.findById(id);
    }

    @Override
    public void deleteById(Long id) {
        billDao.deleteById(id);
    }
}
