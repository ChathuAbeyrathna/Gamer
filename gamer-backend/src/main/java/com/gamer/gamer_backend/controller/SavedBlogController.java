package com.gamer.gamer_backend.controller;

import com.gamer.gamer_backend.models.SavedBlog;
import com.gamer.gamer_backend.service.SavedBlogService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

/**
 * REST controller for managing saved blogs.
 */
@RestController
@RequestMapping("/api/saved-blogs")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class SavedBlogController {

    // Service for saved blog operations
    private final SavedBlogService service;

    /**
     * Toggles the saved state of a blog for the current user.
     * 
     * @param blogId    ID of the blog to toggle
     * @param principal Authenticated user
     * @return true if saved, false if unsaved
     */
    @PostMapping("/toggle/{blogId}")
    public boolean toggleSave(@PathVariable String blogId, Principal principal) {
        return service.toggleSave(principal.getName(), blogId);
    }

    /**
     * Retrieves all blogs saved by the current user.
     * 
     * @param principal Authenticated user
     * @return List of saved blogs
     */
    @GetMapping
    public List<SavedBlog> getSavedBlogs(Principal principal) {
        return service.getSavedBlogs(principal.getName());
    }

    /**
     * Removes a blog from the current user's saved list.
     * 
     * @param blogId    ID of the blog to unsave
     * @param principal Authenticated user
     */
    @DeleteMapping("/{blogId}")
    public void unsaveBlog(@PathVariable String blogId, Principal principal) {
        service.unsaveBlog(principal.getName(), blogId);
    }

}
