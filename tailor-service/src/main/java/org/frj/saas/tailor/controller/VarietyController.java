package org.frj.saas.tailor.controller;

import org.frj.saas.tailor.dto.VarietyDto;
import org.frj.saas.tailor.service.VarietyService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/varieties")
public class VarietyController {

    private static final Logger log = LoggerFactory.getLogger(VarietyController.class);

    private final VarietyService varietyService;

    public VarietyController(VarietyService varietyService) {
        this.varietyService = varietyService;
    }

    @GetMapping
    public ResponseEntity<List<VarietyDto>> getAllVarieties() {
        log.debug("Fetching all clothing categories");
        List<VarietyDto> list = varietyService.getAllVarieties();
        return ResponseEntity.ok(list);
    }

    @PostMapping
    public ResponseEntity<VarietyDto> saveVariety(@RequestBody VarietyDto variety) {
        log.debug("Creating new clothing category: {}", variety.getType());
        VarietyDto saved = varietyService.saveVariety(variety);
        log.info("Clothing category created successfully with id: {}, name: {}", saved.getId(), saved.getType());
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<VarietyDto> updateVariety(@PathVariable Long id, @RequestBody VarietyDto variety) {
        log.debug("Updating clothing category id: {}", id);
        variety.setId(id);
        VarietyDto updated = varietyService.saveVariety(variety);
        log.info("Clothing category updated successfully with id: {}", id);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVariety(@PathVariable Long id) {
        log.debug("Deleting clothing category id: {}", id);
        varietyService.deleteById(id);
        log.info("Clothing category deleted successfully with id: {}", id);
        return ResponseEntity.noContent().build();
    }
}
