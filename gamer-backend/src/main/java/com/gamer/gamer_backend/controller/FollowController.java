package com.gamer.gamer_backend.controller;

import com.gamer.gamer_backend.models.UserProfile;
import com.gamer.gamer_backend.service.FollowService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/follow")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class FollowController {

    private final FollowService service;

    @PostMapping("/toggle-follow/{email}")
    public Map<String, String> toggleFollow(@PathVariable String email, Principal principal) {
        String status = service.toggleFollow(principal.getName(), email);
        return Map.of("status", status);
    }

    @GetMapping("/status/{email}")
    public Map<String, Boolean> getStatus(@PathVariable String email, Principal principal) {
        return service.getStatus(principal.getName(), email);
    }

    @GetMapping("/followers/{email}")
    public List<UserProfile> getFollowers(@PathVariable String email) {
        return service.getFollowers(email);
    }

    @GetMapping("/following/{email}")
    public List<UserProfile> getFollowing(@PathVariable String email) {
        return service.getFollowing(email);
    }
}
