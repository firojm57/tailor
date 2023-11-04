package org.frj.saas.tailor.service;

import jakarta.transaction.Transactional;
import org.frj.saas.tailor.dao.VarietyDao;
import org.frj.saas.tailor.dto.VarietyDto;
import org.frj.saas.tailor.model.VarietyModel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class VarietyService {

    @Autowired
    private VarietyDao varietyDao;

    public List<VarietyModel> getAllVarieties() {
        return varietyDao.findAllByOrderByIdAsc().stream()
                .map(dto -> new VarietyModel(dto.getId(), dto.getType(), dto.getMeasureList()))
                .collect(Collectors.toList());
    }

    public boolean saveVariety(VarietyModel variety) {
        VarietyDto dto = new VarietyDto(variety.getType(), variety.getMeasureList());
        try {
            varietyDao.save(dto);
            return true;
        } catch (Exception ex) {
            return false;
        }
    }

    public boolean updateVariety(VarietyModel variety) {
        VarietyDto dto = new VarietyDto(variety.getType(), variety.getMeasureList());
        dto.setId(variety.getId());
        try {
            varietyDao.save(dto);
            return true;
        } catch (Exception ex) {
            return false;
        }
    }

    @Transactional
    public boolean deleteById(Long id) {
        try {
            varietyDao.deleteById(id);
            return true;
        } catch (Exception ex) {
            throw new RuntimeException(ex);
        }
    }
}
