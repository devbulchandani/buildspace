package org.devbulchandani.backend.dtos;

public record AuthResponse(
        String token,
        Long userId,
        String email,
        String name
) {}