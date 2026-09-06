package org.frj.saas.tailor.service;

import org.frj.saas.tailor.dao.BillDao;
import org.frj.saas.tailor.dto.bill.BillDto;
import org.frj.saas.tailor.service.impl.BillingServiceImpl;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Pure Mockito unit tests for {@link BillingServiceImpl}.
 */
@ExtendWith(MockitoExtension.class)
class BillingServiceTest {

    @Mock private BillDao billDao;

    @InjectMocks private BillingServiceImpl billingService;

    @Test
    @DisplayName("getAllBills: returns all bills from DAO ordered by id desc")
    void getAllBills_returnsDaoResult() {
        BillDto b1 = bill(2L, "INV-1002", "Alice");
        BillDto b2 = bill(1L, "INV-1001", "Bob");
        when(billDao.findAllByOrderByIdDesc()).thenReturn(List.of(b1, b2));

        List<BillDto> result = billingService.getAllBills();

        assertThat(result).hasSize(2);
        assertThat(result.get(0).getBillNumber()).isEqualTo("INV-1002");
        assertThat(result.get(1).getBillNumber()).isEqualTo("INV-1001");
    }

    @Test
    @DisplayName("getAllBills: returns empty list when no bills exist")
    void getAllBills_noData_returnsEmptyList() {
        when(billDao.findAllByOrderByIdDesc()).thenReturn(List.of());
        assertThat(billingService.getAllBills()).isEmpty();
    }

    @Test
    @DisplayName("saveBill: auto-generates INV bill number when none provided")
    void saveBill_missingBillNumber_generatesOne() {
        BillDto input = bill(null, null, "Customer A");
        BillDto saved = bill(10L, "INV-1700000000", "Customer A");
        when(billDao.save(any(BillDto.class))).thenReturn(saved);

        BillDto result = billingService.saveBill(input);

        assertThat(result.getId()).isEqualTo(10L);
        // billNumber must start with "INV-"
        assertThat(saved.getBillNumber()).startsWith("INV-");
    }

    @Test
    @DisplayName("saveBill: keeps existing bill number when already set")
    void saveBill_existingBillNumber_preserved() {
        BillDto input = bill(null, "CUSTOM-001", "Customer B");
        BillDto saved = bill(11L, "CUSTOM-001", "Customer B");
        when(billDao.save(any(BillDto.class))).thenReturn(saved);

        BillDto result = billingService.saveBill(input);

        assertThat(result.getBillNumber()).isEqualTo("CUSTOM-001");
    }

    @Test
    @DisplayName("getById: returns matching bill wrapped in Optional")
    void getById_existingId_returnsBill() {
        BillDto b = bill(5L, "INV-1005", "Carol");
        when(billDao.findById(5L)).thenReturn(Optional.of(b));

        Optional<BillDto> result = billingService.getById(5L);

        assertThat(result).isPresent();
        assertThat(result.get().getCustomerName()).isEqualTo("Carol");
    }

    @Test
    @DisplayName("getById: returns empty Optional for non-existent id")
    void getById_missingId_returnsEmpty() {
        when(billDao.findById(99L)).thenReturn(Optional.empty());
        assertThat(billingService.getById(99L)).isEmpty();
    }

    @Test
    @DisplayName("deleteById: delegates deletion to DAO")
    void deleteById_callsDao() {
        billingService.deleteById(3L);
        verify(billDao).deleteById(3L);
    }

    @Test
    @DisplayName("getFilteredBills: passes search term and pageable to DAO")
    void getFilteredBills_delegatesToDao() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<BillDto> page = new PageImpl<>(List.of(bill(1L, "INV-1001", "Dave")));
        when(billDao.findFiltered(eq("Dave"), eq(pageable))).thenReturn(page);

        Page<BillDto> result = billingService.getFilteredBills("Dave", pageable);

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getCustomerName()).isEqualTo("Dave");
    }

    @Test
    @DisplayName("getFilteredBills: null search term is normalised to empty string")
    void getFilteredBills_nullSearch_usesEmptyString() {
        Pageable pageable = PageRequest.of(0, 10);
        when(billDao.findFiltered(eq(""), eq(pageable))).thenReturn(Page.empty());

        billingService.getFilteredBills(null, pageable);

        verify(billDao).findFiltered("", pageable);
    }

    // --- helpers ---

    private BillDto bill(Long id, String billNumber, String customerName) {
        BillDto b = new BillDto();
        b.setId(id);
        b.setBillNumber(billNumber);
        b.setCustomerName(customerName);
        return b;
    }
}
