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

    /**
     * Creates a new user profile.
     * @param profile the UserProfile to create
     * @return the saved UserProfile
     */
    public UserProfile createProfile(UserProfile profile) {
        return userProfileRepository.save(profile);
    }

    /**
     * Retrieves all user profiles, sorted by creation date descending.
     * @return list of UserProfiles
     */
    public List<UserProfile> getAllProfiles() {
        return userProfileRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
    }

    /**
     * Finds a user profile by email.
     * @param email the email to search for
     * @return Optional containing the UserProfile if found
     */
    public Optional<UserProfile> getProfileByEmail(String email) {
        return userProfileRepository.findByEmail(email);
    }

    /**
     * Checks if a profile exists for the given email.
     * @param email the email to check
     * @return true if profile exists, false otherwise
     */
    public boolean profileExists(String email) {
        return userProfileRepository.existsByEmail(email);
    }

    /**
     * Updates an existing user profile.
     * @param updatedProfile the profile data to update
     * @return the updated UserProfile
     * @throws RuntimeException if profile is not found
     */
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

    /**
     * Retrieves user profiles for a set of emails.
     * @param emails set of emails to search for
     * @return list of UserProfiles matching the emails
     */
    public List<UserProfile> getProfilesByEmails(Set<String> emails) {
        return userProfileRepository.findByEmailIn(emails);
    }
}
