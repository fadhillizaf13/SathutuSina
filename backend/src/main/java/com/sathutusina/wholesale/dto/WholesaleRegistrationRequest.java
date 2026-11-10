package com.sathutusina.wholesale.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** No role or approval status: clients cannot assign either. */
public record WholesaleRegistrationRequest(
    @NotBlank @Size(max = 120) String businessName,
    @NotBlank @Size(max = 100) String contactPerson,
    @NotBlank @Email @Size(max = 150) String email,
    @NotBlank @Pattern(regexp = "^[+0-9() .-]{7,25}$", message = "Invalid phone number") String phone,
    @Size(max = 80) String businessRegistrationNumber,
    @NotBlank @Size(max = 600) String deliveryAddress,
    @NotBlank @Size(min = 10, max = 72) String password
) { }
