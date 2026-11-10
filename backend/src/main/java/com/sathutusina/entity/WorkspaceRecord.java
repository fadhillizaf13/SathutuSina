package com.sathutusina.entity;

import jakarta.persistence.*;
import java.time.Instant;

/** Transitional per-module workspace record; replace JSON payloads with domain tables over time. */
@Entity
@Table(name="workspace_records", uniqueConstraints=@UniqueConstraint(name="uk_workspace_module_record", columnNames={"module_key","record_key"}))
public class WorkspaceRecord {
    @Id @Column(length=50) public String id;
    @Column(name="module_key", nullable=false, length=50) public String moduleKey;
    @Column(name="record_key", nullable=false, length=80) public String recordKey;
    @Lob @Column(nullable=false) public String payload;
    @Column(nullable=false, updatable=false) public Instant createdAt;
    @Column(nullable=false) public Instant updatedAt;
    @PrePersist public void prePersist() { createdAt=Instant.now(); updatedAt=createdAt; }
    @PreUpdate public void preUpdate() { updatedAt=Instant.now(); }
}
