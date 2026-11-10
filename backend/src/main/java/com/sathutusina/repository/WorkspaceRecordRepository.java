package com.sathutusina.repository;

import com.sathutusina.entity.WorkspaceRecord;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WorkspaceRecordRepository extends JpaRepository<WorkspaceRecord, String> {
    List<WorkspaceRecord> findByModuleKeyOrderByCreatedAtAsc(String moduleKey);
    Optional<WorkspaceRecord> findByModuleKeyAndRecordKey(String moduleKey, String recordKey);
}
