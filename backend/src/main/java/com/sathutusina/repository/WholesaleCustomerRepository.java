package com.sathutusina.repository;

import com.sathutusina.entity.WholesaleCustomer;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WholesaleCustomerRepository extends JpaRepository<WholesaleCustomer, String> {
    boolean existsByEmailIgnoreCase(String email);
    List<WholesaleCustomer> findAllByOrderByCreatedAtDesc();
}
