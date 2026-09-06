package org.frj.saas.tailor.service.impl;

import org.frj.saas.tailor.dao.VarietyDao;
import org.frj.saas.tailor.dto.VarietyDto;
import org.frj.saas.tailor.service.VarietyService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class VarietyServiceImpl implements VarietyService {

    private static final Logger log = LoggerFactory.getLogger(VarietyServiceImpl.class);

    private final VarietyDao varietyDao;

    public VarietyServiceImpl(VarietyDao varietyDao) {
        this.varietyDao = varietyDao;
    }

    @Override
    public List<VarietyDto> getAllVarieties() {
        log.debug("VarietyService: Querying all clothing categories ordered by ID asc");
        return varietyDao.findAllByOrderByIdAsc();
    }

    @Override
    public VarietyDto saveVariety(VarietyDto variety) {
        log.debug("VarietyService: Persisting clothing category type {}", variety.getType());
        VarietyDto saved = varietyDao.save(variety);
        log.info("VarietyService: Saved clothing category id {}, type {}", saved.getId(), saved.getType());
        return saved;
    }

    @Override
    public void deleteById(Long id) {
        log.info("VarietyService: Deleting clothing category with id {}", id);
        varietyDao.deleteById(id);
    }
}
