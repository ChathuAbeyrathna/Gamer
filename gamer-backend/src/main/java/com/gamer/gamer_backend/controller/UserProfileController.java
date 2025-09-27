package com.gamer.gamer_backend.controller;

import com.gamer.gamer_backend.models.UserProfile;
import com.gamer.gamer_backend.service.PostService;
import com.gamer.gamer_backend.service.BlogService;
import com.gamer.gamer_backend.service.UserProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

/**
 * REST controller for managing user profiles.
 */
@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
@CrossOrigin
public class UserProfileController {

    // Service for user profile operations
    private final UserProfileService profileService;
    // Service for post operations
    private final PostService postService;
    // Service for blog operations
    private final BlogService blogService;

    /**
     * Creates a new user profile.
     * 
     * @param profile UserProfile object from request body
     * @return Created UserProfile
     */
    @PostMapping("/create")
    public ResponseEntity<UserProfile> createProfile(@RequestBody UserProfile profile) {
        return ResponseEntity.ok(profileService.createProfile(profile));
    }

    /**
     * Retrieves all user profiles.
     * 
     * @return List of UserProfiles
     */
    @GetMapping("/all")
    public ResponseEntity<List<UserProfile>> getAllProfiles() {
        return ResponseEntity.ok(profileService.getAllProfiles());
    }

    /**
     * Retrieves a user profile by email.
     * 
     * @param email Email of the user
     * @return UserProfile if found, 404 otherwise
     */
    @GetMapping("/{email}")
    public ResponseEntity<UserProfile> getProfile(@PathVariable String email) {
        Optional<UserProfile> profile = profileService.getProfileByEmail(email);
        return profile.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * Checks if a user profile exists by email.
     * 
     * @param email Email of the user
     * @return true if exists, false otherwise
     */
    @GetMapping("/exists/{email}")
    public ResponseEntity<Boolean> checkProfile(@PathVariable String email) {
        return ResponseEntity.ok(profileService.profileExists(email));
    }

    /**
     * Updates an existing user profile and propagates changes to posts and blogs.
     * 
     * @param updatedProfile Updated UserProfile object from request body
     * @return Updated UserProfile if found, 404 otherwise
     */
    @PutMapping("/update")
    public ResponseEntity<UserProfile> updateProfile(@RequestBody UserProfile updatedProfile) {
        Optional<UserProfile> existingProfileOptional = profileService.getProfileByEmail(updatedProfile.getEmail());

        if (existingProfileOptional.isPresent()) {
            UserProfile existingProfile = existingProfileOptional.get();
            // Update profile fields
            existingProfile.setGamerName(updatedProfile.getGamerName());
            existingProfile.setImageUrl(updatedProfile.getImageUrl());
            existingProfile.setBio(updatedProfile.getBio());
            existingProfile.setRole(updatedProfile.getRole());

            // Save updated profile
            UserProfile savedProfile = profileService.createProfile(existingProfile);

            // Update related posts with new profile info
            postService.updatePostsWithNewProfileInfo(
                    updatedProfile.getEmail(),
                    updatedProfile.getGamerName(),
                    updatedProfile.getImageUrl());

            // Update related blogs with new profile info
            blogService.updateBlogsWithNewProfileInfo(
                    updatedProfile.getEmail(),
                    updatedProfile.getGamerName(),
                    updatedProfile.getImageUrl());

            return ResponseEntity.ok(savedProfile);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
