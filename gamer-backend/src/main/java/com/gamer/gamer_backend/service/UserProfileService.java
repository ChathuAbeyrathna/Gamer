package com.gamer.gamer_backend.service;

import com.gamer.gamer_backend.models.UserProfile;
import com.gamer.gamer_backend.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserProfileService {

    private final UserProfileRepository userProfileRepository;

    public UserProfile createProfile(UserProfile profile) {
        return userProfileRepository.save(profile);
    }

    public List<UserProfile> getAllProfiles() {
    return userProfileRepository.findAll();
    }

    public Optional<UserProfile> getProfileByEmail(String email) {
        return userProfileRepository.findByEmail(email);
    }

    public boolean profileExists(String email) {
        return userProfileRepository.existsByEmail(email);
    }

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
    
    
}
