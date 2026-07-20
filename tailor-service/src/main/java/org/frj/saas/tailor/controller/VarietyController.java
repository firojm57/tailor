package org.frj.saas.tailor.controller;

import org.frj.saas.tailor.dto.VarietyDto;
import org.frj.saas.tailor.service.VarietyService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/varieties")
public class VarietyController {

    private final VarietyService varietyService;

    public VarietyController(VarietyService varietyService) {
        this.varietyService = varietyService;
    }

    @GetMapping
    public ResponseEntity<List<VarietyDto>> getAllVarieties() {
        return ResponseEntity.ok(varietyService.getAllVarieties());
    }

    @PostMapping
    public ResponseEntity<VarietyDto> saveVariety(@RequestBody VarietyDto variety) {
        VarietyDto saved = varietyService.saveVariety(variety);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<VarietyDto> updateVariety(@PathVariable Long id, @RequestBody VarietyDto variety) {
        variety.setId(id);
        VarietyDto updated = varietyService.saveVariety(variety);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVariety(@PathVariable Long id) {
        varietyService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
