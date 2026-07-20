package org.frj.saas.tailor.service.impl;

import org.frj.saas.tailor.dao.VarietyDao;
import org.frj.saas.tailor.dto.VarietyDto;
import org.frj.saas.tailor.service.VarietyService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class VarietyServiceImpl implements VarietyService {

    private final VarietyDao varietyDao;

    public VarietyServiceImpl(VarietyDao varietyDao) {
        this.varietyDao = varietyDao;
    }

    @Override
    public List<VarietyDto> getAllVarieties() {
        return varietyDao.findAllByOrderByIdAsc();
    }

    @Override
    public VarietyDto saveVariety(VarietyDto variety) {
        return varietyDao.save(variety);
    }

    @Override
    public void deleteById(Long id) {
        varietyDao.deleteById(id);
    }
}
