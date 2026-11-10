package com.sathutusina.auth;

import com.sathutusina.auth.dto.LoginRequest;
import com.sathutusina.auth.dto.UserProfile;
import com.sathutusina.security.AccountDirectory;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.security.web.authentication.session.ChangeSessionIdAuthenticationStrategy;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthenticationManager authenticationManager;
    private final AccountDirectory accounts;
    private final SecurityContextRepository contextRepository;

    public AuthController(AuthenticationManager authenticationManager,
                          AccountDirectory accounts,
                          SecurityContextRepository contextRepository) {
        this.authenticationManager = authenticationManager;
        this.accounts = accounts;
        this.contextRepository = contextRepository;
    }

    /** Call GET /api/auth/csrf (with cookies) before POST /login, /logout or any write API. */
    @GetMapping("/csrf")
    public Map<String, String> csrf(CsrfToken token) {
        return Map.of("headerName", token.getHeaderName(), "token", token.getToken());
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request,
                                   HttpServletRequest httpRequest,
                                   HttpServletResponse httpResponse) {
        try {
            String email = request.email().trim().toLowerCase(java.util.Locale.ROOT);
            Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, request.password()));
            AccountDirectory.Account account = accounts.find(email).orElseThrow();

            // The selected UI role must match the account's actual backend role.
            if (!account.role().equals(request.role())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Incorrect email, role or password"));
            }
            new ChangeSessionIdAuthenticationStrategy().onAuthentication(auth, httpRequest, httpResponse);
            SecurityContext context = SecurityContextHolder.createEmptyContext();
            context.setAuthentication(auth);
            SecurityContextHolder.setContext(context);
            contextRepository.saveContext(context, httpRequest, httpResponse);
            return ResponseEntity.ok(Map.of("user", profile(account)));
        } catch (org.springframework.security.core.AuthenticationException exception) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "Incorrect email, role or password"));
        }
    }

    @GetMapping("/me")
    public Map<String, UserProfile> me(Authentication authentication) {
        AccountDirectory.Account account = accounts.find(authentication.getName()).orElseThrow();
        return Map.of("user", profile(account));
    }

    @PostMapping("/logout")
    public Map<String, String> logout(HttpServletRequest request, HttpServletResponse response,
                                      Authentication authentication) {
        new SecurityContextLogoutHandler().logout(request, response, authentication);
        return Map.of("message", "Logged out");
    }

    private UserProfile profile(AccountDirectory.Account account) {
        return new UserProfile(account.name(), account.email(), account.role());
    }
}
