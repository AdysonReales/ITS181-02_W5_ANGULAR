package com.gabriel.gmartms.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    // In-memory user store for local hosting & testing via Postman
    private static final Map<String, Map<String, Object>> users = new ConcurrentHashMap<>();

    static {
        // Pre-populate demo accounts
        Map<String, Object> user1 = new HashMap<>();
        user1.put("id", 1);
        user1.put("username", "jane_doe");
        user1.put("email", "jane.doe@example.com");
        user1.put("password", "password123");
        user1.put("fullName", "Jane Doe");
        user1.put("role", "COLLECTOR");
        user1.put("balance", 15400.00);
        user1.put("joinedDate", "2024-01-15");
        users.put("jane.doe@example.com", user1);

        Map<String, Object> user2 = new HashMap<>();
        user2.put("id", 2);
        user2.put("username", "antique_hunter");
        user2.put("email", "collector@vintage.com");
        user2.put("password", "vintage2024");
        user2.put("fullName", "Arthur Pendelton");
        user2.put("role", "DEALER");
        user2.put("balance", 28950.00);
        user2.put("joinedDate", "2023-08-20");
        users.put("collector@vintage.com", user2);
    }

    // Maps directly to GET http://localhost:8080/api/auth/users
    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        List<Map<String, Object>> result = new ArrayList<>();
        for (Map<String, Object> u : users.values()) {
            Map<String, Object> safe = new HashMap<>(u);
            safe.remove("password");
            result.add(safe);
        }
        return ResponseEntity.ok(result);
    }

    // Maps directly to POST http://localhost:8080/api/auth/register or sign-up
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> request) {
        logger.info("Register attempt: {}", request.get("email"));
        String email = request.get("email");
        String password = request.get("password");
        String username = request.get("username");
        String fullName = request.get("fullName");

        if (email == null || email.trim().isEmpty() || password == null || password.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Collections.singletonMap("error", "Email and password are required."));
        }

        if (users.containsKey(email.toLowerCase())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Collections.singletonMap("error", "User with this email already exists."));
        }

        int newId = users.size() + 1;
        Map<String, Object> newUser = new HashMap<>();
        newUser.put("id", newId);
        newUser.put("username", username != null ? username : email.split("@")[0]);
        newUser.put("email", email.toLowerCase());
        newUser.put("password", password);
        newUser.put("fullName", fullName != null ? fullName : (username != null ? username : "Antique Enthusiast"));
        newUser.put("role", "MEMBER");
        newUser.put("balance", 5000.00);
        newUser.put("joinedDate", new java.text.SimpleDateFormat("yyyy-MM-dd").format(new Date()));

        users.put(email.toLowerCase(), newUser);

        Map<String, Object> safe = new HashMap<>(newUser);
        safe.remove("password");
        safe.put("message", "Registration successful!");
        return ResponseEntity.status(HttpStatus.CREATED).body(safe);
    }

    // Maps directly to POST http://localhost:8080/api/auth/login or sign-in
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        String identifier = request.get("email") != null ? request.get("email") : request.get("username");
        String password = request.get("password");

        logger.info("Login attempt for identifier: {}", identifier);

        if (identifier == null || password == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Collections.singletonMap("error", "Email/username and password are required."));
        }

        // Search by email or username
        Map<String, Object> foundUser = null;
        for (Map<String, Object> u : users.values()) {
            if (identifier.equalsIgnoreCase((String) u.get("email")) || 
                identifier.equalsIgnoreCase((String) u.get("username"))) {
                foundUser = u;
                break;
            }
        }

        if (foundUser == null || !password.equals(foundUser.get("password"))) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Collections.singletonMap("error", "Invalid credentials."));
        }

        Map<String, Object> safe = new HashMap<>(foundUser);
        safe.remove("password");
        safe.put("message", "Login successful!");
        safe.put("token", UUID.randomUUID().toString());
        return ResponseEntity.ok(safe);
    }
}
