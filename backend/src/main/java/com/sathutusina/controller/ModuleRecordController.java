package com.sathutusina.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sathutusina.entity.ModuleRecord;
import com.sathutusina.repository.ModuleRecordRepository;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

/** Transitional endpoint for remaining UI modules. Design normalized tables before production. */
@RestController
@RequestMapping("/api/modules/{module}/records")
@PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
public class ModuleRecordController {
    private static final Set<String> MODULES = Set.of(
        "attendance", "leave-requests", "payroll", "payments", "stock-transfers",
        "meal-preferences", "raw-materials", "cool-rooms", "vehicles", "outlets",
        "orders", "deliveries", "sales", "returns-wastage", "notifications"
    );
    private final ModuleRecordRepository repository;
    private final ObjectMapper mapper;
    public ModuleRecordController(ModuleRecordRepository repository, ObjectMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    @GetMapping
    public List<ModuleRecord> all(@PathVariable String module) {
        checkModule(module);
        return repository.findByModuleKeyOrderByCreatedAtDesc(module);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ModuleRecord create(@PathVariable String module,
                               @RequestBody Map<String, Object> data, Authentication user) {
        checkModule(module);
        ModuleRecord record = new ModuleRecord();
        record.moduleKey = module;
        record.payload = serialize(data);
        record.createdBy = user.getName();
        return repository.save(record);
    }

    @PutMapping("/{id}")
    public ModuleRecord update(@PathVariable String module, @PathVariable String id,
                               @RequestBody Map<String, Object> data) {
        checkModule(module);
        ModuleRecord record = find(module, id);
        record.payload = serialize(data);
        return repository.save(record);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String module, @PathVariable String id) {
        checkModule(module);
        repository.delete(find(module, id));
    }

    private ModuleRecord find(String module, String id) {
        return repository.findByIdAndModuleKey(id, module).orElseThrow(() ->
            new ResponseStatusException(HttpStatus.NOT_FOUND, "Record not found"));
    }
    private void checkModule(String module) {
        if (!MODULES.contains(module))
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Unknown module");
    }
    private String serialize(Map<String, Object> data) {
        try {
            if (data.isEmpty()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Record cannot be empty");
            String json = mapper.writeValueAsString(data);
            if (json.length() > 20000) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Record is too large");
            return json;
        } catch (JsonProcessingException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid record");
        }
    }
}
