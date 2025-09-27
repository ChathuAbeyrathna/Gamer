package com.gamer.gamer_backend.repository;

import com.gamer.gamer_backend.models.SavedBlog;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface SavedBlogRepository extends MongoRepository<SavedBlog, String> {

    // Get all saved blogs for a specific user, ordered by most recently saved first
    List<SavedBlog> findByUserEmailOrderBySavedAtDesc(String userEmail);

    // Find a specific saved blog by user and blog ID
    Optional<SavedBlog> findByUserEmailAndBlogId(String userEmail, String blogId);

    // Delete a specific saved blog by user and blog ID
    void deleteByUserEmailAndBlogId(String userEmail, String blogId);
}
