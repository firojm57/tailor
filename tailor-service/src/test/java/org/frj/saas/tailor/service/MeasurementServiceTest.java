package org.frj.saas.tailor.service;

import org.frj.saas.tailor.dao.MeasurementDao;
import org.frj.saas.tailor.dto.MeasurementDto;
import org.frj.saas.tailor.service.impl.MeasurementServiceImpl;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Pure Mockito unit tests for {@link MeasurementServiceImpl}.
 */
@ExtendWith(MockitoExtension.class)
class MeasurementServiceTest {

    @Mock private MeasurementDao measurementDao;

    @InjectMocks private MeasurementServiceImpl measurementService;

    @Test
    @DisplayName("getAllMeasurements: returns all records ordered by id desc")
    void getAllMeasurements_returnsDaoResult() {
        MeasurementDto m1 = measurement(2L, "Bob", "Shirt");
        MeasurementDto m2 = measurement(1L, "Alice", "Pant");
        when(measurementDao.findAllByOrderByIdDesc()).thenReturn(List.of(m1, m2));

        List<MeasurementDto> result = measurementService.getAllMeasurements();

        assertThat(result).hasSize(2);
        assertThat(result.get(0).getCustomerName()).isEqualTo("Bob");
    }

    @Test
    @DisplayName("getAllMeasurements: returns empty list when no records exist")
    void getAllMeasurements_noData_returnsEmpty() {
        when(measurementDao.findAllByOrderByIdDesc()).thenReturn(List.of());
        assertThat(measurementService.getAllMeasurements()).isEmpty();
    }

    @Test
    @DisplayName("saveMeasurement: persists and returns the saved entity")
    void saveMeasurement_persistsAndReturns() {
        MeasurementDto input = measurement(null, "Charlie", "Kurta");
        MeasurementDto saved = measurement(7L, "Charlie", "Kurta");
        when(measurementDao.save(input)).thenReturn(saved);

        MeasurementDto result = measurementService.saveMeasurement(input);

        assertThat(result.getId()).isEqualTo(7L);
        assertThat(result.getCustomerName()).isEqualTo("Charlie");
        verify(measurementDao).save(input);
    }

    @Test
    @DisplayName("getById: returns measurement for existing id")
    void getById_existing_returnsDto() {
        MeasurementDto m = measurement(3L, "Diana", "Suit");
        when(measurementDao.findById(3L)).thenReturn(Optional.of(m));

        Optional<MeasurementDto> result = measurementService.getById(3L);

        assertThat(result).isPresent();
        assertThat(result.get().getClothingTypeName()).isEqualTo("Suit");
    }

    @Test
    @DisplayName("getById: returns empty Optional for missing id")
    void getById_missing_returnsEmpty() {
        when(measurementDao.findById(999L)).thenReturn(Optional.empty());
        assertThat(measurementService.getById(999L)).isEmpty();
    }

    @Test
    @DisplayName("deleteById: delegates to DAO")
    void deleteById_callsDao() {
        measurementService.deleteById(4L);
        verify(measurementDao).deleteById(4L);
    }

    @Test
    @DisplayName("getFilteredMeasurements: passes search, typeId, and pageable to DAO")
    void getFilteredMeasurements_delegatesToDao() {
        Pageable pageable = PageRequest.of(0, 20);
        Page<MeasurementDto> page = new PageImpl<>(List.of(measurement(1L, "Eve", "Shirt")));
        when(measurementDao.findFiltered(eq("Eve"), eq(1L), eq(pageable))).thenReturn(page);

        Page<MeasurementDto> result = measurementService.getFilteredMeasurements("Eve", 1L, pageable);

        assertThat(result.getContent()).hasSize(1);
        verify(measurementDao).findFiltered("Eve", 1L, pageable);
    }

    @Test
    @DisplayName("getFilteredMeasurements: null search term is normalised to empty string")
    void getFilteredMeasurements_nullSearch_normalisedToEmpty() {
        Pageable pageable = PageRequest.of(0, 20);
        when(measurementDao.findFiltered(eq(""), eq(0L), eq(pageable))).thenReturn(Page.empty());

        measurementService.getFilteredMeasurements(null, null, pageable);

        verify(measurementDao).findFiltered("", 0L, pageable);
    }

    // --- helpers ---

    private MeasurementDto measurement(Long id, String customerName, String clothingTypeName) {
        MeasurementDto m = new MeasurementDto();
        m.setId(id);
        m.setCustomerName(customerName);
        m.setClothingTypeName(clothingTypeName);
        m.setMobileNumber("9000000000");
        return m;
    }
}
