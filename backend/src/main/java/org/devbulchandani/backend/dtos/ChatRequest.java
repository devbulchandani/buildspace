package org.devbulchandani.backend.dtos;

public record ChatRequest(
        Long learningPlanId,
        String message
) {}
