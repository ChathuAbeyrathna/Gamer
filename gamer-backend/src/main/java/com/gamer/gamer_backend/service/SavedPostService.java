package com.gamer.gamer_backend.service;

import com.gamer.gamer_backend.models.SavedPost;
import com.gamer.gamer_backend.repository.SavedPostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SavedPostService {

    private final SavedPostRepository repository;

    public boolean toggleSave(String userEmail, String postId) {
        var existing = repository.findByUserEmailAndPostId(userEmail, postId);
        if (existing.isPresent()) {
            repository.deleteByUserEmailAndPostId(userEmail, postId);
            return false;
        } else {
            repository.save(SavedPost.builder()
                    .userEmail(userEmail)
                    .postId(postId)
                    .savedAt(Instant.now())
                    .build());
            return true;
        }
    }

    public List<SavedPost> getSavedPosts(String userEmail) {
        return repository.findByUserEmailOrderBySavedAtDesc(userEmail);
    }

    public void unsavePost(String userEmail, String postId) {
        repository.deleteByUserEmailAndPostId(userEmail, postId);
    }

}
