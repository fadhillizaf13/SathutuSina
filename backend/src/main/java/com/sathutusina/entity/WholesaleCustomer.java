package com.sathutusina.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "wholesale_customers", uniqueConstraints =
    @UniqueConstraint(name = "uk_wholesale_email", columnNames = "email"))
public class WholesaleCustomer {
    public enum Status { PENDING, APPROVED, REJECTED }

    @Id
    @Column(length = 36)
    public String id;

    @Column(nullable = false, length = 120)
    public String businessName;

    @Column(nullable = false, length = 100)
    public String contactPerson;

    @Column(nullable = false, length = 150)
    public String email;

    @Column(nullable = false, length = 25)
    public String phone;

    @Column(length = 80)
    public String businessRegistrationNumber;

    @Column(nullable = false, length = 600)
    public String deliveryAddress;

    @JsonIgnore
    @Column(nullable = false, length = 100)
    public String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 12)
    public Status status = Status.PENDING;

    @Column(nullable = false, updatable = false)
    public Instant createdAt;

    public Instant reviewedAt;

    @PrePersist
    void beforeCreate() {
        if (id == null) id = UUID.randomUUID().toString();
        if (createdAt == null) createdAt = Instant.now();
        if (status == null) status = Status.PENDING;
    }
}
