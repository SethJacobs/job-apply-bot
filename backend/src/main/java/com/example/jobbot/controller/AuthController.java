package com.example.jobbot.controller;
import com.example.jobbot.model.User; import com.example.jobbot.repository.UserRepository;
import org.springframework.web.bind.annotation.*;
import java.util.Map; import java.util.Optional; import java.util.UUID;
@RestController @RequestMapping("/api/auth")
public class AuthController {
    private final UserRepository userRepo;
    public AuthController(UserRepository userRepo) {
        this.userRepo = userRepo;
    }
    @PostMapping("/register")
    public Map<String,Object> register(@RequestBody Map<String,String> body) {
        String username = body.get("username");
        String password = body.get("password");
        if(username==null||password==null) return Map.of("error","username and password required");
        Optional<User> existing = userRepo.findByUsername(username);
        if(existing.isPresent()) return Map.of("error","username exists");
        User u = new User();
        u.setUsername(username);
        u.setPassword(password);
        u.setToken(UUID.randomUUID().toString());
        userRepo.save(u);

        return Map.of("token", u.getToken());
    }
    @PostMapping("/login")
    public Map<String,Object> login(@RequestBody Map<String,String> body) {
        String username = body.get("username");
        String password = body.get("password");
        if (username==null||password==null) return Map.of("error","username and password required");
        Optional<User> uo = userRepo.findByUsername(username);
        if(uo.isEmpty()||!uo.get().getPassword().equals(password)) return Map.of("error","invalid credentials");
        User u = uo.get();
        if(u.getToken()==null||u.getToken().isBlank()) {
            u.setToken(UUID.randomUUID().toString());
            userRepo.save(u);
        }

        return Map.of("token", u.getToken());
    }
}
