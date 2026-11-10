package com.sathutusina.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity @Table(name = "production_batches")
public class ProductionBatch {
    @Id public String id;
    @Column(nullable = false) public String productName;
    public Integer quantity;
    public LocalDate productionDate;
    public String status;
    public String shiftName;
    @Column(nullable = false, updatable = false) public Instant createdAt;
    @PrePersist void beforeCreate() {
        if (id == null || id.isBlank()) id = "BAT-" + UUID.randomUUID().toString().substring(0, 8);
        if (createdAt == null) createdAt = Instant.now();
    }
}
