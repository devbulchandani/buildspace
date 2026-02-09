package org.devbulchandani.backend.repositories;

import org.devbulchandani.backend.models.LearningPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LearningPlanRepository extends JpaRepository<LearningPlan, Long> {
    List<LearningPlan> findByUserEmail(String email);
}
