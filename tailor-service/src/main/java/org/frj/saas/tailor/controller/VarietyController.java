package org.frj.saas.tailor.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.frj.saas.tailor.model.VarietyModel;
import org.frj.saas.tailor.service.VarietyService;
import org.frj.saas.tailor.util.Constants;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@CrossOrigin(originPatterns = "*")
@RestController
public class VarietyController {

    @Autowired
    private VarietyService varietyService;

    @GetMapping(Constants.VARIETIES_ENDPOINT)
    public ResponseEntity<?> getAllVarieties() {
        List<VarietyModel> varieties = varietyService.getAllVarieties();
        if (varieties == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(varieties);
    }

    @PostMapping(Constants.VARIETIES_ENDPOINT)
    public ResponseEntity<?> saveVariety(@RequestBody VarietyModel variety, HttpServletRequest request) {
        boolean success = varietyService.saveVariety(variety);
        if (!success) {
            return ResponseEntity.internalServerError().build();
        }
        return ResponseEntity.created(URI.create(request.getRequestURI() + "/" + variety.getType())).build();
    }

    @PutMapping(Constants.VARIETIES_ENDPOINT)
    public ResponseEntity<?> updateType(@RequestBody VarietyModel variety) {
        if (variety.getId() == 0) {
            return ResponseEntity.badRequest().build();
        }
        boolean success = varietyService.updateVariety(variety);
        if (!success) {
            return ResponseEntity.internalServerError().build();
        }
        return ResponseEntity.accepted().build();
    }

    @DeleteMapping(Constants.VARIETIES_TYPE_ENDPOINT)
    public ResponseEntity<?> deleteVariety(@PathVariable Long id) {
        boolean success = varietyService.deleteById(id);
        if (!success) {
            return ResponseEntity.internalServerError().build();
        }
        return ResponseEntity.noContent().build();
    }

}
