package org.frj.saas.tailor.dto;

import jakarta.persistence.*;
import org.frj.saas.tailor.util.StringMapConverter;

import java.util.Map;

@Entity
@Table(name = "measurements")
public class MeasurementDto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "customer_name", nullable = false)
    private String customerName;

    @Column(name = "mobile_number", nullable = false)
    private String mobileNumber;

    @Column(name = "measurement_date", nullable = false)
    private String date;

    @Column(name = "delivery_date")
    private String deliveryDate;

    @Column(name = "clothing_type_id")
    private Long clothingTypeId;

    @Column(name = "clothing_type_name", nullable = false)
    private String clothingTypeName;

    @Column(name = "measurement_values", nullable = false)
    @Convert(converter = StringMapConverter.class)
    private Map<String, String> values;

    @Column(name = "style")
    private String style;

    public MeasurementDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getMobileNumber() { return mobileNumber; }
    public void setMobileNumber(String mobileNumber) { this.mobileNumber = mobileNumber; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public String getDeliveryDate() { return deliveryDate; }
    public void setDeliveryDate(String deliveryDate) { this.deliveryDate = deliveryDate; }

    public Long getClothingTypeId() { return clothingTypeId; }
    public void setClothingTypeId(Long clothingTypeId) { this.clothingTypeId = clothingTypeId; }

    public String getClothingTypeName() { return clothingTypeName; }
    public void setClothingTypeName(String clothingTypeName) { this.clothingTypeName = clothingTypeName; }

    public Map<String, String> getValues() { return values; }
    public void setValues(Map<String, String> values) { this.values = values; }

    public String getStyle() { return style; }
    public void setStyle(String style) { this.style = style; }
}
