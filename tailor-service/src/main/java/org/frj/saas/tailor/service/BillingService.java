package org.frj.saas.tailor.service;

import org.frj.saas.tailor.dto.bill.BillDto;
import java.util.List;
import java.util.Optional;

public interface BillingService {
    List<BillDto> getAllBills();
    BillDto saveBill(BillDto bill);
    Optional<BillDto> getById(Long id);
    void deleteById(Long id);
}
