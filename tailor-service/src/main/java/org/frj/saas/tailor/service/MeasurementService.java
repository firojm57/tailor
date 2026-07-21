package org.frj.saas.tailor.service;

import org.frj.saas.tailor.dto.MeasurementDto;
import java.util.List;
import java.util.Optional;

public interface MeasurementService {
    List<MeasurementDto> getAllMeasurements();
    MeasurementDto saveMeasurement(MeasurementDto measurement);
    Optional<MeasurementDto> getById(Long id);
    void deleteById(Long id);
}
