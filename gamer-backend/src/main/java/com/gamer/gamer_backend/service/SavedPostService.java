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

    /**
     * Toggles the saved state of a post for a user.
     * If the post is already saved, it will be unsaved and return false.
     * If the post is not saved, it will be saved and return true.
     *
     * @param userEmail the email of the user
     * @param postId the ID of the post
     * @return true if the post was saved, false if it was unsaved
     */
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

    /**
     * Retrieves all saved posts for a user, ordered by save time descending.
     *
     * @param userEmail the email of the user
     * @return list of saved posts
     */
    public List<SavedPost> getSavedPosts(String userEmail) {
        return repository.findByUserEmailOrderBySavedAtDesc(userEmail);
    }

    /**
     * Removes a saved post for a user.
     *
     * @param userEmail the email of the user
     * @param postId the ID of the post to unsave
     */
    public void unsavePost(String userEmail, String postId) {
        repository.deleteByUserEmailAndPostId(userEmail, postId);
    }

}
