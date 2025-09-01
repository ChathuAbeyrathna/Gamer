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

    public UserProfile createProfile(UserProfile profile) {
        return userProfileRepository.save(profile);
    }

    public List<UserProfile> getAllProfiles() {
        return userProfileRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
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

    public List<UserProfile> getProfilesByEmails(Set<String> emails) {
        return userProfileRepository.findByEmailIn(emails);
    }
}
