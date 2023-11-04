package org.frj.saas.tailor.dao;

import org.frj.saas.tailor.dto.VarietyDto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VarietyDao extends JpaRepository<VarietyDto, Long> {
    List<VarietyDto> findAllByOrderByIdAsc();

}
