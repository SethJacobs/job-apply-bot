package com.example.jobbot;
import com.example.jobbot.model.JobSource;
import com.example.jobbot.repository.JobSourceRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
@Component
public class SourceSeeder implements CommandLineRunner {
    private final JobSourceRepository repo;
    public SourceSeeder(JobSourceRepository repo) {
        this.repo = repo;
    }
    @Override public void run(String... args) throws Exception {
        if(repo.count() == 0) {
            JobSource s1 = new JobSource();
            s1.setName("WeWorkRemotely - Remote Jobs RSS");
            s1.setUrl("https://weworkremotely.com/remote-jobs.rss");
            s1.setType("rss");
            repo.save(s1);
            JobSource s2 = new JobSource();
            s2.setName("Greenhouse - Airtable");
            s2.setUrl("https://boards.greenhouse.io/airtable");
            s2.setType("links");
            repo.save(s2);
            JobSource s3 = new JobSource();
            s3.setName("Lever Demo Feed");
            s3.setUrl("https://api.lever.co/v0/postings/leverdemo?mode=json");
            s3.setType("jsonld");
            repo.save(s3);
            System.out.println("Seeded job sources: weworkremotely, greenhouse (airtable), lever demo");
        } else {
            System.out.println("Sources exist; skipping seeding");
        }
    }
}
