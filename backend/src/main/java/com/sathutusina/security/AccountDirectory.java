package com.sathutusina.security;

import java.util.List;
import java.util.Locale;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class AccountDirectory {
    public record Account(String email, String password, String name, String role) { }
    private final List<Account> accounts;

    public AccountDirectory(
            @Value("${app.accounts.admin.email}") String adminEmail,
            @Value("${app.accounts.admin.password}") String adminPassword,
            @Value("${app.accounts.admin.name}") String adminName,
            @Value("${app.accounts.manager.email}") String managerEmail,
            @Value("${app.accounts.manager.password}") String managerPassword,
            @Value("${app.accounts.manager.name}") String managerName,
            @Value("${app.accounts.staff.email}") String staffEmail,
            @Value("${app.accounts.staff.password}") String staffPassword,
            @Value("${app.accounts.staff.name}") String staffName) {
        accounts = List.of(
            new Account(adminEmail.toLowerCase(Locale.ROOT), adminPassword, adminName, "Admin"),
            new Account(managerEmail.toLowerCase(Locale.ROOT), managerPassword, managerName, "Manager"),
            new Account(staffEmail.toLowerCase(Locale.ROOT), staffPassword, staffName, "Staff")
        );
    }

    public List<Account> all() { return accounts; }
    public Optional<Account> find(String email) {
        return accounts.stream().filter(a -> a.email().equalsIgnoreCase(email)).findFirst();
    }
}
