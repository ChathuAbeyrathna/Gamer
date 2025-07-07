package com.gamer.gamer_backend.repository;

import com.gamer.gamer_backend.models.UserProfile;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;
import java.util.Set;
import java.util.List;

public interface UserProfileRepository extends MongoRepository<UserProfile, String> {

    // Get profile by email
    Optional<UserProfile> findByEmail(String email);

    // Check if a profile exists by email
    boolean existsByEmail(String email);

    // Get multiple profiles by a set of emails (for followers/following/blocked)
    List<UserProfile> findByEmailIn(Set<String> emails);
}
