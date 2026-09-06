package org.frj.saas.tailor.service;

import org.frj.saas.tailor.dto.MeasurementDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

public interface MeasurementService {
    List<MeasurementDto> getAllMeasurements();
    Page<MeasurementDto> getFilteredMeasurements(String search, Long clothingTypeId, Pageable pageable);
    MeasurementDto saveMeasurement(MeasurementDto measurement);
    Optional<MeasurementDto> getById(Long id);
    void deleteById(Long id);
}
