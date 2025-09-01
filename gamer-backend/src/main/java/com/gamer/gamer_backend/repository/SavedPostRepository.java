package com.gamer.gamer_backend.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.gamer.gamer_backend.models.SavedPost;
import java.util.List;
import java.util.Optional;

public interface SavedPostRepository extends MongoRepository<SavedPost, String> {
    List<SavedPost> findByUserEmailOrderBySavedAtDesc(String userEmail);

    Optional<SavedPost> findByUserEmailAndPostId(String userEmail, String postId);

    void deleteByUserEmailAndPostId(String userEmail, String postId);
}
