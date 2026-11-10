package com.sathutusina.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity @Table(name = "products")
public class Product {
    @Id public String id;
    @Column(nullable = false) public String name;
    @Column(unique = true, nullable = false) public String sku;
    public Integer stock;
    public Integer minStock;
    public BigDecimal price;
    public LocalDate expiry;
    public String status;
    @Column(nullable = false, updatable = false) public Instant createdAt;
    @PrePersist void beforeCreate() {
        if (id == null || id.isBlank()) id = "PRD-" + UUID.randomUUID().toString().substring(0, 8);
        if (createdAt == null) createdAt = Instant.now();
    }
}
