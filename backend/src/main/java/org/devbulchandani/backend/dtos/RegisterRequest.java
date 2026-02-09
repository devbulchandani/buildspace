package org.devbulchandani.backend.dtos;

public record RegisterRequest(
        String email,
        String password,
        String name
) {}
