package com.example.jobbot.controller;
import com.example.jobbot.model.JobSource; import com.example.jobbot.repository.JobSourceRepository; import com.example.jobbot.service.ScraperService;
import org.springframework.web.bind.annotation.*; import java.util.List;
@RestController @RequestMapping("/api/sources")
public class JobSourceController {
    private final JobSourceRepository repo; private final ScraperService scraper;
    public JobSourceController(JobSourceRepository repo, ScraperService scraper) {
        this.repo = repo;
        this.scraper = scraper;
    }
    @GetMapping public List<JobSource> list() {
        return repo.findAll();
    }
    @PostMapping public JobSource create(@RequestBody JobSource s) {
        return repo.save(s);
    }
    @PostMapping("/scrape/{id}") public String scrape(@PathVariable Long id) {
        return repo.findById(id).map(s->{
            try {
                scraper.scrapeSource(s);
                return "ok";
        } catch(Exception e) {
                return "error: " + e.getMessage();
            }
        }).orElse("not found");
    }
}
