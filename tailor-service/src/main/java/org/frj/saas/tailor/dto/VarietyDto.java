package org.frj.saas.tailor.dto;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "varieties")
public class VarietyDto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String type;

    @Column(name = "measure_list")
    private List<String> measureList;

    public VarietyDto(String type, List<String> measureList) {
        this.type = type;
        this.measureList = measureList;
    }
}
