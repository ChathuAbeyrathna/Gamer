package com.gamer.gamer_backend.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.gamer.gamer_backend.models.SavedBlog;
import java.util.List;
import java.util.Optional;

public interface SavedBlogRepository extends MongoRepository<SavedBlog, String> {
    List<SavedBlog> findByUserEmailOrderBySavedAtDesc(String userEmail);
    Optional<SavedBlog> findByUserEmailAndBlogId(String userEmail, String blogId);
    void deleteByUserEmailAndBlogId(String userEmail, String blogId);
}


