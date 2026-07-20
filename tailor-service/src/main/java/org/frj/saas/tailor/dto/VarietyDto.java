package org.frj.saas.tailor.dto;

import jakarta.persistence.*;
import org.frj.saas.tailor.util.StringListConverter;

import java.util.List;

@Entity
@Table(name = "varieties")
public class VarietyDto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String type;

    @Column(name = "measure_list", nullable = false)
    @Convert(converter = StringListConverter.class)
    private List<String> measureList;

    public VarietyDto() {}

    public VarietyDto(String type, List<String> measureList) {
        this.type = type;
        this.measureList = measureList;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public List<String> getMeasureList() { return measureList; }
    public void setMeasureList(List<String> measureList) { this.measureList = measureList; }
}
