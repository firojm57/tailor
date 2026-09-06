package org.frj.saas.tailor.service;

import org.frj.saas.tailor.dao.VarietyDao;
import org.frj.saas.tailor.dto.VarietyDto;
import org.frj.saas.tailor.service.impl.VarietyServiceImpl;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Pure Mockito unit tests for {@link VarietyServiceImpl}.
 */
@ExtendWith(MockitoExtension.class)
class VarietyServiceTest {

    @Mock private VarietyDao varietyDao;

    @InjectMocks private VarietyServiceImpl varietyService;

    @Test
    @DisplayName("getAllVarieties: returns all clothing categories ordered by id asc")
    void getAllVarieties_returnsDaoResult() {
        VarietyDto v1 = variety(1L, "Shirt");
        VarietyDto v2 = variety(2L, "Pant");
        when(varietyDao.findAllByOrderByIdAsc()).thenReturn(List.of(v1, v2));

        List<VarietyDto> result = varietyService.getAllVarieties();

        assertThat(result).hasSize(2);
        assertThat(result.get(0).getType()).isEqualTo("Shirt");
        assertThat(result.get(1).getType()).isEqualTo("Pant");
    }

    @Test
    @DisplayName("getAllVarieties: returns empty list when no categories configured")
    void getAllVarieties_empty_returnsEmptyList() {
        when(varietyDao.findAllByOrderByIdAsc()).thenReturn(List.of());
        assertThat(varietyService.getAllVarieties()).isEmpty();
    }

    @Test
    @DisplayName("saveVariety: persists new category and returns saved entity")
    void saveVariety_persistsAndReturns() {
        VarietyDto input = variety(null, "Sherwani");
        VarietyDto saved = variety(5L, "Sherwani");
        when(varietyDao.save(input)).thenReturn(saved);

        VarietyDto result = varietyService.saveVariety(input);

        assertThat(result.getId()).isEqualTo(5L);
        assertThat(result.getType()).isEqualTo("Sherwani");
        verify(varietyDao).save(input);
    }

    @Test
    @DisplayName("saveVariety: updating existing category preserves its id")
    void saveVariety_updateExisting_preservesId() {
        VarietyDto existing = variety(3L, "Kurta");
        when(varietyDao.save(existing)).thenReturn(existing);

        VarietyDto result = varietyService.saveVariety(existing);

        assertThat(result.getId()).isEqualTo(3L);
    }

    @Test
    @DisplayName("deleteById: delegates deletion to DAO")
    void deleteById_callsDao() {
        varietyService.deleteById(2L);
        verify(varietyDao).deleteById(2L);
    }

    @Test
    @DisplayName("deleteById: DAO is called exactly once per invocation")
    void deleteById_calledOnce() {
        varietyService.deleteById(7L);
        verify(varietyDao, times(1)).deleteById(7L);
    }

    // --- helpers ---

    private VarietyDto variety(Long id, String type) {
        VarietyDto v = new VarietyDto();
        v.setId(id);
        v.setType(type);
        return v;
    }
}
