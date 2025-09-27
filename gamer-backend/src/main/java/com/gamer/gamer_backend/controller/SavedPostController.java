package com.gamer.gamer_backend.controller;

import com.gamer.gamer_backend.models.SavedPost;
import com.gamer.gamer_backend.service.SavedPostService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

/**
 * REST controller for managing saved posts.
 */
@RestController
@RequestMapping("/api/saved-posts")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class SavedPostController {

    // Service for saved post operations
    private final SavedPostService service;

    /**
     * Toggles the saved status of a post for the current user.
     *
     * @param postId    ID of the post to toggle
     * @param principal Authenticated user
     * @return true if post is now saved, false otherwise
     */
    @PostMapping("/toggle/{postId}")
    public boolean toggleSave(@PathVariable String postId, Principal principal) {
        return service.toggleSave(principal.getName(), postId);
    }

    /**
     * Retrieves all saved posts for the current user.
     *
     * @param principal Authenticated user
     * @return List of saved posts
     */
    @GetMapping
    public List<SavedPost> getSavedPosts(Principal principal) {
        return service.getSavedPosts(principal.getName());
    }

    /**
     * Removes a post from the user's saved posts.
     *
     * @param postId    ID of the post to unsave
     * @param principal Authenticated user
     */
    @DeleteMapping("/{postId}")
    public void unsavePost(@PathVariable String postId, Principal principal) {
        service.unsavePost(principal.getName(), postId);
    }

}
