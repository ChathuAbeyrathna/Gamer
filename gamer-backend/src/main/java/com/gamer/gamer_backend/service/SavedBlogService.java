package com.gamer.gamer_backend.service;

import com.gamer.gamer_backend.models.SavedBlog;
import com.gamer.gamer_backend.repository.SavedBlogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SavedBlogService {

    private final SavedBlogRepository repository;

    /**
     * Toggles the saved state of a blog for a user.
     * If the blog is already saved, it will be unsaved. Otherwise, it will be saved.
     *
     * @param userEmail the email of the user
     * @param blogId the ID of the blog
     * @return true if the blog was saved, false if it was unsaved
     */
    public boolean toggleSave(String userEmail, String blogId) {
        var existing = repository.findByUserEmailAndBlogId(userEmail, blogId);
        if (existing.isPresent()) {
            // Unsave the blog if it is already saved
            repository.deleteByUserEmailAndBlogId(userEmail, blogId);
            return false;
        } else {
            // Save the blog if it is not already saved
            repository.save(SavedBlog.builder()
                    .userEmail(userEmail)
                    .blogId(blogId)
                    .savedAt(Instant.now())
                    .build());
            return true;
        }
    }

    /**
     * Retrieves all blogs saved by a user, ordered by save time descending.
     *
     * @param userEmail the email of the user
     * @return list of saved blogs
     */
    public List<SavedBlog> getSavedBlogs(String userEmail) {
        return repository.findByUserEmailOrderBySavedAtDesc(userEmail);
    }

    /**
     * Removes a saved blog for a user.
     *
     * @param userEmail the email of the user
     * @param blogId the ID of the blog to unsave
     */
    public void unsaveBlog(String userEmail, String blogId) {
        repository.deleteByUserEmailAndBlogId(userEmail, blogId);
    }

}
