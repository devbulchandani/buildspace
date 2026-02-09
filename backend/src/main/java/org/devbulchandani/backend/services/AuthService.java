package org.devbulchandani.backend.services;

import org.devbulchandani.backend.dtos.AuthResponse;
import org.devbulchandani.backend.dtos.LoginRequest;
import org.devbulchandani.backend.dtos.RegisterRequest;
import org.devbulchandani.backend.models.User;
import org.devbulchandani.backend.repositories.UserRepository;
import org.devbulchandani.backend.utils.JwtUtil;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    private final UserRepository userRepo;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepo, JwtUtil jwtUtil) {
        this.userRepo = userRepo;
        this.jwtUtil = jwtUtil;
    }

    public AuthResponse register(RegisterRequest registerRequest) {
        if (userRepo.findByEmail(registerRequest.email()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }
        String hashedPassword = BCrypt.hashpw(registerRequest.password(), BCrypt.gensalt());
        User user = User.builder()
                .email(registerRequest.email())
                .passwordHash(hashedPassword)
                .name(registerRequest.name())
                .build();
        userRepo.save(user);
        String token = jwtUtil.generateToken(user.getEmail());
        return new AuthResponse(token, user.getId(), user.getEmail(), user.getName());
    }

    public AuthResponse login(LoginRequest loginRequest) {

        User user = userRepo.findByEmail(loginRequest.email())
                .orElseThrow(() -> new RuntimeException("User not found"));

        boolean matches = BCrypt.checkpw(loginRequest.password(), user.getPasswordHash());

        if (!matches) {
            throw new RuntimeException("Invalid credentials");
        }

        String token = jwtUtil.generateToken(user.getEmail());

        return new AuthResponse(token, user.getId(), user.getEmail(), user.getName());
    }

}
