package com.example.jobbot.model;
import jakarta.persistence.*;
import java.time.Instant;
@Entity
public class JobPosting {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String source; private String title; private String company; private String location;
    @Column(columnDefinition = "text") private String description;
    private String url;
    private Instant postedAt;
    private Instant fetchedAt;
    public Long getId() { return id;}
    public void setId(Long id) { this.id = id;}
    public String getSource() { return source;}
    public void setSource(String source) { this.source = source;}
    public String getTitle() { return title;}
    public void setTitle(String title) { this.title = title;}
    public String getCompany() { return company;}
    public void setCompany(String company) { this.company = company;}
    public String getLocation() { return location;}
    public void setLocation(String location) { this.location = location;}
    public String getDescription() { return description;}
    public void setDescription(String description) { this.description = description;}
    public String getUrl() { return url;}
    public void setUrl(String url) { this.url = url;}
    public Instant getPostedAt() { return postedAt;}
    public void setPostedAt(Instant postedAt) { this.postedAt = postedAt;}
    public Instant getFetchedAt() { return fetchedAt;}
    public void setFetchedAt(Instant fetchedAt) { this.fetchedAt = fetchedAt;}
}
