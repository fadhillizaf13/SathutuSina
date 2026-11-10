package com.sathutusina.security;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
class AccountDirectoryTest {
    @Test
    void keepsBackendAssignedRoleForAnEmail() {
        AccountDirectory directory = new AccountDirectory(
            "admin@example.test", "dev-secret-1", "Admin Name",
            "manager@example.test", "dev-secret-2", "Manager Name",
            "staff@example.test", "dev-secret-3", "Staff Name");
        assertEquals("Admin", directory.find("ADMIN@example.test").orElseThrow().role());
        assertEquals("Manager", directory.find("manager@example.test").orElseThrow().role());
        assertTrue(directory.find("unknown@example.test").isEmpty());
    }
}
