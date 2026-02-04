package org.devbulchandani.backend.services;

import org.devbulchandani.backend.models.Milestone;
import org.springframework.stereotype.Service;

@Service
public class MilestoneContextService {
    public String buildMilestoneContext(Milestone m) {
        return """
        === CURRENT MILESTONE ===
        Number: %d
        Title: %s
        Description: %s
        Learning Objective: %s
        Status: %s
        """
                .formatted(
                        m.getSequenceNumber(),
                        m.getTitle(),
                        m.getDescription(),
                        m.getLearningObjectives(),
                        m.isCompleted() ? "COMPLETED" : "PENDING"
                );
    }
}
