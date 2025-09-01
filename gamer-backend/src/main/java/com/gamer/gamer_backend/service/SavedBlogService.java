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

    public boolean toggleSave(String userEmail, String blogId) {
        var existing = repository.findByUserEmailAndBlogId(userEmail, blogId);
        if (existing.isPresent()) {
            repository.deleteByUserEmailAndBlogId(userEmail, blogId);
            return false;
        } else {
            repository.save(SavedBlog.builder()
                    .userEmail(userEmail)
                    .blogId(blogId)
                    .savedAt(Instant.now())
                    .build());
            return true;
        }
    }

    public List<SavedBlog> getSavedBlogs(String userEmail) {
        return repository.findByUserEmailOrderBySavedAtDesc(userEmail);
    }

    public void unsaveBlog(String userEmail, String blogId) {
        repository.deleteByUserEmailAndBlogId(userEmail, blogId);
    }

}
