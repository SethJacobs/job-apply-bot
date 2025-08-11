package com.example.jobbot.repository;
import com.example.jobbot.model.JobSource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
@Repository
public interface JobSourceRepository extends JpaRepository<JobSource, Long> {
}
