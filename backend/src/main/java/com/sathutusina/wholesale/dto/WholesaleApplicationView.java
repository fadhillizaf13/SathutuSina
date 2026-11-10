package com.sathutusina.wholesale.dto;

import com.sathutusina.entity.WholesaleCustomer;
import java.time.Instant;

/** Explicit response fields: never include passwordHash. */
public record WholesaleApplicationView(
    String id, String businessName, String contactPerson, String email,
    String phone, String businessRegistrationNumber, String deliveryAddress,
    String status, Instant createdAt, Instant reviewedAt
) {
    public static WholesaleApplicationView from(WholesaleCustomer customer) {
        return new WholesaleApplicationView(
            customer.id, customer.businessName, customer.contactPerson,
            customer.email, customer.phone, customer.businessRegistrationNumber,
            customer.deliveryAddress, customer.status.name(),
            customer.createdAt, customer.reviewedAt
        );
    }
}
