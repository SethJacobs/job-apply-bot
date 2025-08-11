package com.example.jobbot.model;
import jakarta.persistence.*;
@Entity
public class Profile {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long userId;
    private String name;
    private String email;
    private String phone;
    private String location;
    @Column(columnDefinition = "text")
    private String linksJson;
    @Column(columnDefinition = "text")
    private String resumeText;
    public Long getId() {
        return id;
    } 
    public void setId(Long id) {  
        this.id = id;
    }
    public Long getUserId() { 
        return userId; 
    } 
    public void setUserId(Long userId) { 
        this.userId = userId;
    }
    public String getName() { 
        return name;
    } 
    public void setName(String name) {
        this.name = name; }
    public String getEmail() {
        return email;
    }
    public void setEmail(String email) {
        this.email = email;
    }
    public String getPhone() {
        return phone;
    }
    public void setPhone(String phone) {
        this.phone = phone;
    }
    public String getLocation() {
        return location;
    }
    public void setLocation(String location) {
        this.location = location;
    }
    public String getLinksJson() {
        return linksJson;
    }
    public void setLinksJson(String linksJson) {
        this.linksJson = linksJson;
    }
    public String getResumeText() {
        return resumeText;
    }
    public void setResumeText(String resumeText) {
        this.resumeText = resumeText;
    }
}
