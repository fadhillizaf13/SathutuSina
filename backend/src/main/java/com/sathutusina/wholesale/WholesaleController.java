package com.sathutusina.wholesale;

import com.sathutusina.entity.WholesaleCustomer;
import com.sathutusina.repository.WholesaleCustomerRepository;
import com.sathutusina.security.AccountDirectory;
import com.sathutusina.wholesale.dto.WholesaleApplicationView;
import com.sathutusina.wholesale.dto.WholesaleRegistrationRequest;
import jakarta.validation.Valid;
import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/wholesale")
public class WholesaleController {
    private final WholesaleCustomerRepository customers;
    private final PasswordEncoder encoder;
    private final AccountDirectory staffAccounts;

    public WholesaleController(WholesaleCustomerRepository customers,
                               PasswordEncoder encoder, AccountDirectory staffAccounts) {
        this.customers = customers;
        this.encoder = encoder;
        this.staffAccounts = staffAccounts;
    }

    /** Public application. This never creates a staff account or grants login permissions. */
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody WholesaleRegistrationRequest request) {
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        if (customers.existsByEmailIgnoreCase(email) || staffAccounts.find(email).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This email is already registered");
        }

        WholesaleCustomer customer = new WholesaleCustomer();
        customer.businessName = request.businessName().trim();
        customer.contactPerson = request.contactPerson().trim();
        customer.email = email;
        customer.phone = request.phone().trim();
        customer.businessRegistrationNumber =
            request.businessRegistrationNumber() == null ? "" : request.businessRegistrationNumber().trim();
        customer.deliveryAddress = request.deliveryAddress().trim();
        customer.passwordHash = encoder.encode(request.password());
        customer.status = WholesaleCustomer.Status.PENDING;
        try {
            WholesaleCustomer saved = customers.saveAndFlush(customer);
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "message", "Registration submitted for review",
                "referenceId", saved.id,
                "status", saved.status.name()
            ));
        } catch (DataIntegrityViolationException exception) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This email is already registered");
        }
    }

    /** Administrative review only; protected by authentication AND role. */
    @GetMapping("/applications")
    @PreAuthorize("hasRole('ADMIN')")
    public List<WholesaleApplicationView> applications() {
        return customers.findAllByOrderByCreatedAtDesc().stream()
            .map(WholesaleApplicationView::from).toList();
    }

    @PostMapping("/applications/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public WholesaleApplicationView approve(@PathVariable String id) {
        return review(id, WholesaleCustomer.Status.APPROVED);
    }

    @PostMapping("/applications/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public WholesaleApplicationView reject(@PathVariable String id) {
        return review(id, WholesaleCustomer.Status.REJECTED);
    }

    private WholesaleApplicationView review(String id, WholesaleCustomer.Status target) {
        WholesaleCustomer customer = customers.findById(id).orElseThrow(() ->
            new ResponseStatusException(HttpStatus.NOT_FOUND, "Application not found"));
        if (customer.status != WholesaleCustomer.Status.PENDING) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Application already reviewed");
        }
        customer.status = target;
        customer.reviewedAt = Instant.now();
        return WholesaleApplicationView.from(customers.save(customer));
    }
}
