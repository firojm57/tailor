package org.frj.saas.tailor.controller;

import org.frj.saas.tailor.dto.MeasurementDto;
import org.frj.saas.tailor.dto.PagedResponse;
import org.frj.saas.tailor.service.MeasurementService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/measurements")
public class MeasurementController {

    private static final Logger log = LoggerFactory.getLogger(MeasurementController.class);

    private final MeasurementService measurementService;

    public MeasurementController(MeasurementService measurementService) {
        this.measurementService = measurementService;
    }

    @GetMapping
    public ResponseEntity<PagedResponse<MeasurementDto>> getMeasurements(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @RequestParam(value = "search", defaultValue = "") String search,
            @RequestParam(value = "clothingTypeId", defaultValue = "0") Long clothingTypeId
    ) {
        log.debug("Fetching measurements page={}, size={}, search='{}', clothingTypeId={}", page, size, search, clothingTypeId);
        Page<MeasurementDto> result = measurementService.getFilteredMeasurements(
                search, clothingTypeId, PageRequest.of(page, size)
        );
        PagedResponse<MeasurementDto> response = new PagedResponse<>(
                result.getContent(),
                result.getNumber(),
                result.getSize(),
                result.getTotalElements(),
                result.getTotalPages(),
                result.isLast()
        );
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<MeasurementDto> createMeasurement(@RequestBody MeasurementDto measurement) {
        log.debug("Creating new measurement for customer: {}, category: {}", measurement.getCustomerName(), measurement.getClothingTypeName());
        MeasurementDto saved = measurementService.saveMeasurement(measurement);
        log.info("Measurement record saved successfully with id: {} for customer: {}", saved.getId(), saved.getCustomerName());
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<MeasurementDto> updateMeasurement(@PathVariable Long id, @RequestBody MeasurementDto measurement) {
        log.debug("Updating measurement with id: {}", id);
        measurement.setId(id);
        MeasurementDto updated = measurementService.saveMeasurement(measurement);
        log.info("Measurement record updated successfully with id: {}", id);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMeasurement(@PathVariable Long id) {
        log.debug("Deleting measurement with id: {}", id);
        measurementService.deleteById(id);
        log.info("Measurement record deleted successfully with id: {}", id);
        return ResponseEntity.noContent().build();
    }
}
