package org.frj.saas.tailor.controller;

import org.frj.saas.tailor.dto.MeasurementDto;
import org.frj.saas.tailor.dto.PagedResponse;
import org.frj.saas.tailor.service.MeasurementService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/measurements")
public class MeasurementController {

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
        MeasurementDto saved = measurementService.saveMeasurement(measurement);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<MeasurementDto> updateMeasurement(@PathVariable Long id, @RequestBody MeasurementDto measurement) {
        measurement.setId(id);
        MeasurementDto updated = measurementService.saveMeasurement(measurement);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMeasurement(@PathVariable Long id) {
        measurementService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
