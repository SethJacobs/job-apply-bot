package com.example.jobbot.controller;
import com.example.jobbot.model.Profile; import com.example.jobbot.model.User;
import com.example.jobbot.repository.ProfileRepository; import com.example.jobbot.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper; import org.springframework.web.bind.annotation.*;
import java.util.*;
@RestController
@RequestMapping("/api/profiles")
public class ProfileController {
    private final ProfileRepository profileRepo;
    private final UserRepository userRepo;
    private final ObjectMapper mapper = new ObjectMapper();
    public ProfileController(ProfileRepository profileRepo, UserRepository userRepo) {
        this.profileRepo = profileRepo; this.userRepo = userRepo;
    }
    private Optional<User> userForToken(String auth) {
        if(auth==null||!auth.startsWith("Bearer ")) return Optional.empty();
        String token = auth.substring(7); return userRepo.findByToken(token);
    }
    @GetMapping
    public Object list(@RequestHeader(value="Authorization", required=false) String auth) {
        Optional<User> u = userForToken(auth);
        if(u.isEmpty()) return Map.of("error","unauthorized");
        List<Profile> profiles = profileRepo.findByUserId(u.get().getId());
        List<Map<String,Object>> out = new ArrayList<>();
        for(Profile p : profiles) {
            Map<String,Object> m = new HashMap<>(); m.put("id", p.getId()); m.put("name", p.getName()); m.put("email", p.getEmail()); m.put("phone", p.getPhone()); m.put("location", p.getLocation());
            try {
                m.put("links", p.getLinksJson()==null? Map.of() : mapper.readValue(p.getLinksJson(), Map.class));
            } catch(Exception e) {
                m.put("links", Map.of());
            }
            m.put("resumeText", p.getResumeText()); out.add(m);
        }
        return out;
    }
    @PostMapping
    public Object create(@RequestHeader(value="Authorization", required=false) String auth, @RequestBody Map<String,Object> body) {
        Optional<User> u = userForToken(auth);
        if(u.isEmpty()) return Map.of("error","unauthorized");
        Profile p = new Profile(); p.setUserId(u.get().getId());
        p.setName((String)body.getOrDefault("name",""));
        p.setEmail((String)body.getOrDefault("email",""));
        p.setPhone((String)body.getOrDefault("phone",""));
        p.setLocation((String)body.getOrDefault("location",""));
        try{
            p.setLinksJson(mapper.writeValueAsString(body.getOrDefault("links", Map.of())));
        } catch(Exception e) {
            p.setLinksJson("{}");
        }
        p.setResumeText((String)body.getOrDefault("resumeText",""));
        profileRepo.save(p);
        return Map.of("ok", true, "id", p.getId());
    }
    @PutMapping("/{id}")
    public Object update(@RequestHeader(value="Authorization", required=false) String auth, @PathVariable Long id, @RequestBody Map<String,Object> body) {
        Optional<User> u = userForToken(auth);
        if(u.isEmpty()) return Map.of("error","unauthorized");
        Optional<Profile> po = profileRepo.findById(id);
        if(po.isEmpty()) return Map.of("error","not found");
        Profile p = po.get();
        if(!p.getUserId().equals(u.get().getId())) return Map.of("error","forbidden");
        p.setName((String)body.getOrDefault("name",p.getName()));
        p.setEmail((String)body.getOrDefault("email",p.getEmail()));
        p.setPhone((String)body.getOrDefault("phone",p.getPhone()));
        p.setLocation((String)body.getOrDefault("location",p.getLocation()));
        try {
            p.setLinksJson(mapper.writeValueAsString(body.getOrDefault("links", Map.of())));
        } catch(Exception e) {}
        p.setResumeText((String)body.getOrDefault("resumeText",p.getResumeText()));
        profileRepo.save(p); return Map.of("ok", true);
    }
    @DeleteMapping("/{id}")
    public Object delete(@RequestHeader(value="Authorization", required=false) String auth, @PathVariable Long id) {
        Optional<User> u = userForToken(auth);
        if(u.isEmpty()) return Map.of("error","unauthorized");
        Optional<Profile> po = profileRepo.findById(id);
        if(po.isEmpty()) return Map.of("error","not found");
        Profile p = po.get();
        if(!p.getUserId().equals(u.get().getId())) return Map.of("error","forbidden");
        profileRepo.delete(p); return Map.of("ok", true);
    }
    @GetMapping("/current")
    public Object current(@RequestHeader(value="Authorization", required=false) String auth) {
        Optional<User> u = userForToken(auth);
        if(u.isEmpty()) return Map.of("error","unauthorized");
        List<Profile> profiles = profileRepo.findByUserId(u.get().getId());
        if(profiles.isEmpty()) return Map.of(); Profile p = profiles.get(0);
        Map<String,Object> m = new HashMap<>();
        m.put("name", p.getName());
        m.put("email", p.getEmail());
        m.put("phone", p.getPhone());
        m.put("location", p.getLocation());
        try {
            m.put("links", p.getLinksJson()==null? Map.of() : mapper.readValue(p.getLinksJson(), Map.class));
        } catch(Exception e) {
            m.put("links", Map.of());
        }
        m.put("resumeText", p.getResumeText());
        return m;
    }
}
