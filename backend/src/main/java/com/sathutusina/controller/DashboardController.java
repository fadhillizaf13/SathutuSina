package com.sathutusina.controller;
import com.sathutusina.repository.EmployeeRepository;
import com.sathutusina.repository.ProductRepository;
import com.sathutusina.repository.ProductionBatchRepository;
import java.util.Map;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController @RequestMapping("/api/dashboard")
public class DashboardController {
    private final EmployeeRepository employees;
    private final ProductRepository products;
    private final ProductionBatchRepository batches;
    public DashboardController(EmployeeRepository employees, ProductRepository products,
                               ProductionBatchRepository batches) {
        this.employees = employees; this.products = products; this.batches = batches;
    }
    @GetMapping("/summary")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public Map<String, Object> summary() {
        long lowStock = products.findAll().stream().filter(p ->
            p.stock != null && p.minStock != null && p.stock < p.minStock).count();
        return Map.of("totalEmployees", employees.count(), "totalProducts", products.count(),
                      "productionBatches", batches.count(), "lowStockAlerts", lowStock);
    }
}
