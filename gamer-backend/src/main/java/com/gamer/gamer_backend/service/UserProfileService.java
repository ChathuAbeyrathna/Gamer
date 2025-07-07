package com.gamer.gamer_backend.service;

import com.gamer.gamer_backend.models.UserProfile;
import com.gamer.gamer_backend.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Sort;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class UserProfileService {

    private final UserProfileRepository userProfileRepository;

    // Create or update a profile
    public UserProfile createProfile(UserProfile profile) {
        return userProfileRepository.save(profile);
    }

    // Get all user profiles
    public List<UserProfile> getAllProfiles() {
        return userProfileRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
    }

    // Get one profile by email
    public Optional<UserProfile> getProfileByEmail(String email) {
        return userProfileRepository.findByEmail(email);
    }

    // Check if a profile exists
    public boolean profileExists(String email) {
        return userProfileRepository.existsByEmail(email);
    }

    // Update an existing profile
    public UserProfile updateProfile(UserProfile updatedProfile) {
        Optional<UserProfile> existingProfile = userProfileRepository.findByEmail(updatedProfile.getEmail());
        if (existingProfile.isPresent()) {
            UserProfile profile = existingProfile.get();
            profile.setGamerName(updatedProfile.getGamerName());
            profile.setBio(updatedProfile.getBio());
            profile.setRole(updatedProfile.getRole());
            profile.setImageUrl(updatedProfile.getImageUrl());
            return userProfileRepository.save(profile);
        } else {
            throw new RuntimeException("Profile not found for email: " + updatedProfile.getEmail());
        }
    }

    // 🔹 (Optional use by FollowService)
    public List<UserProfile> getProfilesByEmails(Set<String> emails) {
        return userProfileRepository.findByEmailIn(emails);
    }
}
