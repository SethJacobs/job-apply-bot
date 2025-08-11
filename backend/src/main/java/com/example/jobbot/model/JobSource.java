package com.example.jobbot.model;
import jakarta.persistence.*;
@Entity
public class JobSource {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String url;
    @Column(columnDefinition = "text")
    private String selector;
    private String type;
    public Long getId() { return id;} public void setId(Long id) { this.id = id;}
    public String getName() { return name;} public void setName(String name) { this.name = name;}
    public String getUrl() { return url;} public void setUrl(String url) { this.url = url;}
    public String getSelector() { return selector;} public void setSelector(String selector) { this.selector = selector;}
    public String getType() { return type;} public void setType(String type) { this.type = type;}
}
