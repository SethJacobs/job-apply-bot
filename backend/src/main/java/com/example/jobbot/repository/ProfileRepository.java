package com.example.jobbot.repository;
import com.example.jobbot.model.Profile;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface ProfileRepository extends JpaRepository<Profile, Long> {
    List<Profile> findByUserId(Long userId);
}
