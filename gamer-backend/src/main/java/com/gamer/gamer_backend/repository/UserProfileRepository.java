package com.gamer.gamer_backend.repository;

import com.gamer.gamer_backend.models.UserProfile;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface UserProfileRepository extends MongoRepository<UserProfile, String> {
    Optional<UserProfile> findByEmail(String email);
    boolean existsByEmail(String email);
}
