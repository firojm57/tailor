package org.frj.saas.tailor.dao;

import org.frj.saas.tailor.dto.MeasurementDto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MeasurementDao extends JpaRepository<MeasurementDto, Long> {
    List<MeasurementDto> findAllByOrderByIdDesc();
}
