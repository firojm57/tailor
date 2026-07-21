package org.frj.saas.tailor.dto.bill;

import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "billing")
public class BillDto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "bill_number", nullable = false, unique = true)
    private String billNumber;

    @Column(name = "customer_name", nullable = false)
    private String customerName;

    @Column(name = "mobile_number", nullable = false)
    private String mobileNumber;

    @Column(name = "bill_date", nullable = false)
    private String date;

    @Column(name = "due_date")
    private String dueDate;

    @Column(name = "total_amount")
    private Double totalAmount = 0.0;

    @Column(name = "discount")
    private Double discount = 0.0;

    @Column(name = "grand_total")
    private Double grandTotal = 0.0;

    @Column(name = "paid")
    private Boolean paid = false;

    @Column(name = "notes")
    private String notes;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JoinColumn(name = "bill_id")
    private List<BillItemDto> items = new ArrayList<>();

    public BillDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getBillNumber() { return billNumber; }
    public void setBillNumber(String billNumber) { this.billNumber = billNumber; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getMobileNumber() { return mobileNumber; }
    public void setMobileNumber(String mobileNumber) { this.mobileNumber = mobileNumber; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public String getDueDate() { return dueDate; }
    public void setDueDate(String dueDate) { this.dueDate = dueDate; }

    public Double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(Double totalAmount) { this.totalAmount = totalAmount; }

    public Double getDiscount() { return discount; }
    public void setDiscount(Double discount) { this.discount = discount; }

    public Double getGrandTotal() { return grandTotal; }
    public void setGrandTotal(Double grandTotal) { this.grandTotal = grandTotal; }

    public Boolean getPaid() { return paid; }
    public void setPaid(Boolean paid) { this.paid = paid; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public List<BillItemDto> getItems() { return items; }
    public void setItems(List<BillItemDto> items) { this.items = items; }
}
