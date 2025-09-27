package com.gamer.gamer_backend.repository;

import com.gamer.gamer_backend.models.SavedPost;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface SavedPostRepository extends MongoRepository<SavedPost, String> {

    // Get all saved posts for a specific user, ordered by most recently saved first
    List<SavedPost> findByUserEmailOrderBySavedAtDesc(String userEmail);

    // Find a specific saved post by user and post ID
    Optional<SavedPost> findByUserEmailAndPostId(String userEmail, String postId);

    // Delete a specific saved post by user and post ID
    void deleteByUserEmailAndPostId(String userEmail, String postId);
}
