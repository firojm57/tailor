package org.frj.saas.tailor.service;

import org.frj.saas.tailor.dto.VarietyDto;
import java.util.List;

public interface VarietyService {
    List<VarietyDto> getAllVarieties();
    VarietyDto saveVariety(VarietyDto variety);
    void deleteById(Long id);
}
