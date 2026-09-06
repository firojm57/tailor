package org.frj.saas.tailor.dao;

import org.frj.saas.tailor.dto.bill.BillDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BillDao extends JpaRepository<BillDto, Long> {
    List<BillDto> findAllByOrderByIdDesc();

    @Query("SELECT b FROM BillDto b WHERE " +
           "(:search = '' OR LOWER(b.billNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(b.customerName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(b.mobileNumber) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "ORDER BY b.id DESC")
    Page<BillDto> findFiltered(@Param("search") String search, Pageable pageable);
}
