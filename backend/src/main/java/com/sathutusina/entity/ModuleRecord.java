package com.sathutusina.entity;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name="module_records", indexes=@Index(name="idx_module_key", columnList="module_key"))
public class ModuleRecord {
    @Id public String id;
    @Column(name = "module_key", nullable = false) public String moduleKey;
    @Lob @Column(nullable = false) public String payload;
    public String createdBy;
    public Instant createdAt;
    public Instant updatedAt;
    @PrePersist public void onCreate() {
        if (id == null || id.isBlank()) id = "REC-" + UUID.randomUUID().toString().substring(0, 12);
        createdAt = Instant.now();
        updatedAt = createdAt;
    }
    @PreUpdate public void onUpdate() { updatedAt = Instant.now(); }
}
