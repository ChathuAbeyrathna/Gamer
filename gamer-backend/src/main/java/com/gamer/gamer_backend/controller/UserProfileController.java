package com.gamer.gamer_backend.controller;

import com.gamer.gamer_backend.models.UserProfile;
import com.gamer.gamer_backend.service.UserProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
@CrossOrigin
public class UserProfileController {

    private final UserProfileService profileService;

    @PostMapping("/create")
    public ResponseEntity<UserProfile> createProfile(@RequestBody UserProfile profile) {
        return ResponseEntity.ok(profileService.createProfile(profile));
    }

    @GetMapping("/{email}")
    public ResponseEntity<UserProfile> getProfile(@PathVariable String email) {
        Optional<UserProfile> profile = profileService.getProfileByEmail(email);
        return profile.map(ResponseEntity::ok)
                      .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/exists/{email}")
    public ResponseEntity<Boolean> checkProfile(@PathVariable String email) {
        return ResponseEntity.ok(profileService.profileExists(email));
    }

    @PutMapping("/update")
    public ResponseEntity<UserProfile> updateProfile(@RequestBody UserProfile updatedProfile) {
        return ResponseEntity.ok(profileService.updateProfile(updatedProfile));
    }

}
