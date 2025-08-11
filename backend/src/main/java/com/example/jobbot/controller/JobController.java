package com.example.jobbot.controller;
import com.example.jobbot.model.JobPosting;
import com.example.jobbot.repository.JobPostingRepository;
import org.springframework.http.ResponseEntity; import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController @RequestMapping("/api/jobs")
public class JobController {
    private final JobPostingRepository repo;
    public JobController(JobPostingRepository repo) {
        this.repo = repo;
    }
    @GetMapping
    public List<JobPosting> list() {
        return repo.findAll();
    }
    @GetMapping("/{id}")
    public ResponseEntity<JobPosting> get(@PathVariable Long id) {
        return repo.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }
    @PostMapping
    public JobPosting create(@RequestBody JobPosting job) {
        return repo.save(job);
    }
}
