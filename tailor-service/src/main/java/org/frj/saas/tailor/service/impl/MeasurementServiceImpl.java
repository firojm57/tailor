package org.frj.saas.tailor.service.impl;

import org.frj.saas.tailor.dao.MeasurementDao;
import org.frj.saas.tailor.dto.MeasurementDto;
import org.frj.saas.tailor.service.MeasurementService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class MeasurementServiceImpl implements MeasurementService {

    private static final Logger log = LoggerFactory.getLogger(MeasurementServiceImpl.class);

    private final MeasurementDao measurementDao;

    public MeasurementServiceImpl(MeasurementDao measurementDao) {
        this.measurementDao = measurementDao;
    }

    @Override
    public List<MeasurementDto> getAllMeasurements() {
        log.debug("MeasurementService: Fetching all measurements ordered by ID desc");
        return measurementDao.findAllByOrderByIdDesc();
    }

    @Override
    public Page<MeasurementDto> getFilteredMeasurements(String search, Long clothingTypeId, Pageable pageable) {
        String searchTerm = search == null ? "" : search.trim();
        Long typeId = clothingTypeId == null ? 0L : clothingTypeId;
        log.debug("MeasurementService: Querying filtered measurements with term '{}', clothingTypeId {}", searchTerm, typeId);
        return measurementDao.findFiltered(searchTerm, typeId, pageable);
    }

    @Override
    public MeasurementDto saveMeasurement(MeasurementDto measurement) {
        log.debug("MeasurementService: Persisting measurement for customer {}", measurement.getCustomerName());
        MeasurementDto saved = measurementDao.save(measurement);
        log.info("MeasurementService: Saved measurement record id {} for customer {}", saved.getId(), saved.getCustomerName());
        return saved;
    }

    @Override
    public Optional<MeasurementDto> getById(Long id) {
        log.debug("MeasurementService: Fetching measurement by id {}", id);
        return measurementDao.findById(id);
    }

    @Override
    public void deleteById(Long id) {
        log.info("MeasurementService: Deleting measurement record with id {}", id);
        measurementDao.deleteById(id);
    }
}
