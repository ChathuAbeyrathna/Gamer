package com.gamer.gamer_backend.repository;

import com.gamer.gamer_backend.models.Boost;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface BoostRepository extends MongoRepository<Boost, String> {

    // Find a boost by user email and post ID (used to check if a user has boosted a post)
    Optional<Boost> findByUserEmailAndPostId(String userEmail, String postId);

    // Find all boosts for a specific post
    List<Boost> findByPostId(String postId);

    // Delete a boost for a post by a specific user
    void deleteByUserEmailAndPostId(String userEmail, String postId);
}
