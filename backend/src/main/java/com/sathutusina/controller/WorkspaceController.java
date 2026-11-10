package com.sathutusina.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sathutusina.entity.WorkspaceRecord;
import com.sathutusina.repository.WorkspaceRecordRepository;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

/** Generic workspace CRUD for development. Per-role access is enforced on every method. */
@RestController
@RequestMapping("/api/workspace")
public class WorkspaceController {
    private static final List<String> ALL_MODULES = List.of(
       "employees", "attendance", "leaves", "payroll", "meals", "batches", "products",
       "materials", "rooms", "transfers", "orders", "deliveries", "sales", "payments",
       "vehicles", "outlets", "returns", "notifications"
    );
    private static final Set<String> STAFF_MODULES = Set.of(
       "attendance", "leaves", "meals", "batches", "products", "notifications"
    );
    private static final Set<String> MANAGER_RESTRICTED = Set.of("payroll", "payments");
    private final WorkspaceRecordRepository repository;
    private final ObjectMapper mapper;
    public WorkspaceController(WorkspaceRecordRepository repository, ObjectMapper mapper) {
        this.repository=repository; this.mapper=mapper;
    }
    private boolean allowed(String module, Authentication auth) {
        if (!ALL_MODULES.contains(module)) return false;
        if (auth == null || !auth.isAuthenticated()) return false;
        boolean admin=auth.getAuthorities().stream().anyMatch(a->a.getAuthority().equals("ROLE_ADMIN"));
        boolean manager=auth.getAuthorities().stream().anyMatch(a->a.getAuthority().equals("ROLE_MANAGER"));
        boolean staff=auth.getAuthorities().stream().anyMatch(a->a.getAuthority().equals("ROLE_STAFF"));
        return admin || (manager && !MANAGER_RESTRICTED.contains(module)) || (staff && STAFF_MODULES.contains(module));
    }
    private void requireAccess(String module, Authentication auth) {
        if (!ALL_MODULES.contains(module)) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Unknown module");
        if (!allowed(module, auth)) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not allowed for role");
    }
    private Map<String,Object> parsePayload(WorkspaceRecord entry) {
        try { return mapper.readValue(entry.payload, new TypeReference<Map<String,Object>>() {}); }
        catch (JsonProcessingException ex) { throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Stored record is invalid"); }
    }
    private Map<String,Object> sanitize(Map<String,Object> record) {
        if (record == null || record.isEmpty()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Record cannot be empty");
        if (record.size() > 30) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Too many fields");
        for (Map.Entry<String,Object> field : record.entrySet()) {
            if (field.getKey().length() > 50) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid field name");
            if (field.getValue() != null && field.getValue().toString().length() > 1000) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Value too long");
        }
        return record;
    }
    @GetMapping
    @Transactional(readOnly=true)
    public Map<String,List<Map<String,Object>>> all(Authentication auth) {
        Map<String,List<Map<String,Object>>> result=new LinkedHashMap<>();
        for (String module : ALL_MODULES) {
            result.put(module, allowed(module,auth) ? repository.findByModuleKeyOrderByCreatedAtAsc(module)
                .stream().map(this::parsePayload).toList() : List.of());
        }
        return result;
    }
    @PostMapping("/{module}")
    @ResponseStatus(HttpStatus.CREATED)
    @Transactional
    public Map<String,Object> add(@PathVariable String module, @RequestBody Map<String,Object> data, Authentication auth) {
        requireAccess(module,auth);
        Map<String,Object> fields=sanitize(data);
        String id=String.valueOf(fields.getOrDefault("id", "")).trim();
        if (id.isEmpty()) id=module.substring(0,3).toUpperCase()+"-"+UUID.randomUUID().toString().substring(0,8);
        if (id.length()>80) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Record ID too long");
        if (repository.findByModuleKeyAndRecordKey(module,id).isPresent())
            throw new ResponseStatusException(HttpStatus.CONFLICT,"Duplicate record ID");
        fields.put("id",id);
        WorkspaceRecord row=new WorkspaceRecord();
        row.id=UUID.randomUUID().toString(); row.moduleKey=module; row.recordKey=id;
        row.payload=write(fields);
        repository.save(row); return fields;
    }
    @PutMapping("/{module}/{id}")
    @Transactional
    public Map<String,Object> update(@PathVariable String module, @PathVariable String id,
                                     @RequestBody Map<String,Object> data, Authentication auth) {
        requireAccess(module,auth);
        WorkspaceRecord row=repository.findByModuleKeyAndRecordKey(module,id).orElseThrow(()->
            new ResponseStatusException(HttpStatus.NOT_FOUND,"Record not found"));
        Map<String,Object> fields=sanitize(data); fields.put("id",id);
        row.payload=write(fields);
        repository.save(row); return fields;
    }
    @DeleteMapping("/{module}/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Transactional
    public void delete(@PathVariable String module, @PathVariable String id, Authentication auth) {
        requireAccess(module,auth);
        WorkspaceRecord row=repository.findByModuleKeyAndRecordKey(module,id).orElseThrow(()->
            new ResponseStatusException(HttpStatus.NOT_FOUND,"Record not found"));
        repository.delete(row);
    }
    private String write(Map<String,Object> data) {
        try {
            String json=mapper.writeValueAsString(data);
            if (json.getBytes(StandardCharsets.UTF_8).length>20_000)
               throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Record too large");
            return json;
        } catch (JsonProcessingException ex) { throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Bad record"); }
    }
}
