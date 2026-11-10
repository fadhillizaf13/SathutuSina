package com.sathutusina.controller;
import com.sathutusina.entity.Employee;
import com.sathutusina.repository.EmployeeRepository;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/employees")
public class EmployeeController {
    private final EmployeeRepository repository;
    public EmployeeController(EmployeeRepository repository) { this.repository = repository; }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public List<Employee> all() { return repository.findAll(); }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public Employee one(@PathVariable String id) { return find(id); }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public Employee create(@RequestBody Employee input) {
        validate(input);
        Employee stored = new Employee();
        stored.name = input.name;
        stored.email = input.email;
        stored.department = input.department;
        stored.designation = input.designation;
        stored.salary = input.salary;
        stored.status = input.status;
        return repository.save(stored);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public Employee update(@PathVariable String id, @RequestBody Employee input) {
        validate(input);
        Employee stored = find(id);
        stored.name = input.name;
        stored.email = input.email;
        stored.department = input.department;
        stored.designation = input.designation;
        stored.salary = input.salary;
        stored.status = input.status;
        return repository.save(stored);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public void delete(@PathVariable String id) { repository.delete(find(id)); }

    private Employee find(String id) {
        return repository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Employee not found"));
    }

    private void validate(Employee input) {
        if (input.name == null || input.name.isBlank())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "name is required");
        if (input.email == null || input.email.isBlank()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email is required");
    }
}
