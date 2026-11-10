package com.sathutusina.repository;
import com.sathutusina.entity.ModuleRecord;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
public interface ModuleRecordRepository extends JpaRepository<ModuleRecord,String> {
    List<ModuleRecord> findByModuleKeyOrderByCreatedAtDesc(String moduleKey);
    Optional<ModuleRecord> findByIdAndModuleKey(String id, String moduleKey);
}
