package org.frj.saas.tailor.dao;

import org.frj.saas.tailor.dto.bill.BillDto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BillDao extends JpaRepository<BillDto, Long> {
    List<BillDto> findAllByOrderByIdDesc();
}
