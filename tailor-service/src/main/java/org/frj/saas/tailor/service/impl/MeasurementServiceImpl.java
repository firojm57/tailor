package org.frj.saas.tailor.service.impl;

import org.frj.saas.tailor.dao.MeasurementDao;
import org.frj.saas.tailor.dto.MeasurementDto;
import org.frj.saas.tailor.service.MeasurementService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class MeasurementServiceImpl implements MeasurementService {

    private final MeasurementDao measurementDao;

    public MeasurementServiceImpl(MeasurementDao measurementDao) {
        this.measurementDao = measurementDao;
    }

    @Override
    public List<MeasurementDto> getAllMeasurements() {
        return measurementDao.findAllByOrderByIdDesc();
    }

    @Override
    public MeasurementDto saveMeasurement(MeasurementDto measurement) {
        return measurementDao.save(measurement);
    }

    @Override
    public Optional<MeasurementDto> getById(Long id) {
        return measurementDao.findById(id);
    }

    @Override
    public void deleteById(Long id) {
        measurementDao.deleteById(id);
    }
}
