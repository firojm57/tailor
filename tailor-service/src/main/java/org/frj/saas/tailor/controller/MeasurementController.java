package org.frj.saas.tailor.controller;

import org.frj.saas.tailor.dto.MeasurementDto;
import org.frj.saas.tailor.service.MeasurementService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/measurements")
public class MeasurementController {

    private final MeasurementService measurementService;

    public MeasurementController(MeasurementService measurementService) {
        this.measurementService = measurementService;
    }

    @GetMapping
    public ResponseEntity<List<MeasurementDto>> getAllMeasurements() {
        return ResponseEntity.ok(measurementService.getAllMeasurements());
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
