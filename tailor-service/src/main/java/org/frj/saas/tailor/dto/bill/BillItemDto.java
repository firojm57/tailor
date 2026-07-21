package org.frj.saas.tailor.dto.bill;

import jakarta.persistence.*;

@Entity
@Table(name = "billing_items")
public class BillItemDto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "clothing_type_id")
    private Long clothingTypeId;

    @Column(name = "clothing_type_name", nullable = false)
    private String clothingTypeName;

    @Column(name = "quantity")
    private Integer quantity = 1;

    @Column(name = "price")
    private Double price = 0.0;

    @Column(name = "description")
    private String description;

    public BillItemDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getClothingTypeId() { return clothingTypeId; }
    public void setClothingTypeId(Long clothingTypeId) { this.clothingTypeId = clothingTypeId; }

    public String getClothingTypeName() { return clothingTypeName; }
    public void setClothingTypeName(String clothingTypeName) { this.clothingTypeName = clothingTypeName; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
