package org.frj.saas.tailor.service;

import org.frj.saas.tailor.dto.bill.BillDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

public interface BillingService {
    List<BillDto> getAllBills();
    Page<BillDto> getFilteredBills(String search, Pageable pageable);
    BillDto saveBill(BillDto bill);
    Optional<BillDto> getById(Long id);
    void deleteById(Long id);
}
