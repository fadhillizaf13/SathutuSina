package com.sathutusina.controller;
import com.sathutusina.entity.Product;
import com.sathutusina.repository.ProductRepository;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/products")
public class ProductController {
    private final ProductRepository repository;
    public ProductController(ProductRepository repository) { this.repository = repository; }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','STAFF')")
    public List<Product> all() { return repository.findAll(); }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','STAFF')")
    public Product one(@PathVariable String id) { return find(id); }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public Product create(@RequestBody Product input) {
        validate(input);
        Product stored = new Product();
        stored.name = input.name;
        stored.sku = input.sku;
        stored.stock = input.stock;
        stored.minStock = input.minStock;
        stored.price = input.price;
        stored.expiry = input.expiry;
        stored.status = input.status;
        return repository.save(stored);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public Product update(@PathVariable String id, @RequestBody Product input) {
        validate(input);
        Product stored = find(id);
        stored.name = input.name;
        stored.sku = input.sku;
        stored.stock = input.stock;
        stored.minStock = input.minStock;
        stored.price = input.price;
        stored.expiry = input.expiry;
        stored.status = input.status;
        return repository.save(stored);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public void delete(@PathVariable String id) { repository.delete(find(id)); }

    private Product find(String id) {
        return repository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
    }

    private void validate(Product input) {
        if (input.name == null || input.name.isBlank())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "name is required");
        if (input.sku == null || input.sku.isBlank()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "SKU is required");
    }
}
