package com.gamer.gamer_backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.gamer.gamer_backend.models.Post;
import com.gamer.gamer_backend.models.UserProfile;
import com.gamer.gamer_backend.service.PostService;
import com.gamer.gamer_backend.service.UserProfileService;

import java.util.List;
import java.util.Optional;

/**
 * PostController
 * - Handles CRUD operations for posts
 * - Associates posts with user profiles
 * - CORS enabled for localhost:3000 frontend
 */
@RestController
@RequestMapping("/api/posts")
@CrossOrigin(origins = "http://localhost:3000")
public class PostController {

    private final PostService postService;
    private final UserProfileService userProfileService;

    // Constructor injection ensures better testability and cleaner code
    public PostController(PostService postService, UserProfileService userProfileService) {
        this.postService = postService;
        this.userProfileService = userProfileService;
    }

    /**
     * Create a new post
     * - Sets userName and userImage from UserProfile if exists
     * - Returns the created post
     */
    @PostMapping("/create")
    public Post createPost(@RequestBody Post post) {
        Optional<UserProfile> profileOptional = userProfileService.getProfileByEmail(post.getEmail());

        if (profileOptional.isPresent()) {
            UserProfile profile = profileOptional.get();
            post.setUserName(profile.getGamerName());
            post.setUserImage(profile.getImageUrl());
        }

        return postService.createPost(post);
    }

    /**
     * Get a single post by ID
     * - Returns 200 OK if found, 404 Not Found if not
     */
    @GetMapping("/{postId}")
    public ResponseEntity<Post> getPostById(@PathVariable String postId) {
        Optional<Post> post = postService.getPostById(postId);
        return post.map(ResponseEntity::ok)
                   .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * Get all posts
     */
    @GetMapping("/all")
    public List<Post> getAllPosts() {
        return postService.getAllPosts();
    }

    /**
     * Get posts by a specific user
     */
    @GetMapping("/user/{email}")
    public List<Post> getUserPosts(@PathVariable String email) {
        return postService.getPostsByEmail(email);
    }

    /**
     * Edit an existing post
     * - Updates the post content
     */
    @PutMapping("/edit/{id}")
    public Post editPost(@PathVariable String id, @RequestBody Post updatedPost) {
        return postService.updatePost(id, updatedPost);
    }

    /**
     * Delete a post by ID
     */
    @DeleteMapping("/delete/{id}")
    public void deletePost(@PathVariable String id) {
        postService.deletePost(id);
    }
}
