package com.sathutusina.controller;
import com.sathutusina.entity.ProductionBatch;
import com.sathutusina.repository.ProductionBatchRepository;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/production/batches")
public class ProductionBatchController {
    private final ProductionBatchRepository repository;
    public ProductionBatchController(ProductionBatchRepository repository) { this.repository = repository; }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','STAFF')")
    public List<ProductionBatch> all() { return repository.findAll(); }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','STAFF')")
    public ProductionBatch one(@PathVariable String id) { return find(id); }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ProductionBatch create(@RequestBody ProductionBatch input) {
        validate(input);
        ProductionBatch stored = new ProductionBatch();
        stored.productName = input.productName;
        stored.quantity = input.quantity;
        stored.productionDate = input.productionDate;
        stored.status = input.status;
        stored.shiftName = input.shiftName;
        return repository.save(stored);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ProductionBatch update(@PathVariable String id, @RequestBody ProductionBatch input) {
        validate(input);
        ProductionBatch stored = find(id);
        stored.productName = input.productName;
        stored.quantity = input.quantity;
        stored.productionDate = input.productionDate;
        stored.status = input.status;
        stored.shiftName = input.shiftName;
        return repository.save(stored);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public void delete(@PathVariable String id) { repository.delete(find(id)); }

    private ProductionBatch find(String id) {
        return repository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "ProductionBatch not found"));
    }

    private void validate(ProductionBatch input) {
        if (input.productName == null || input.productName.isBlank())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "productName is required");
        if (input.quantity == null || input.quantity < 0) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nonnegative quantity required");
    }
}
