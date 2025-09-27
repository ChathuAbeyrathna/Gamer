package com.gamer.gamer_backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.gamer.gamer_backend.models.Blog;
import com.gamer.gamer_backend.models.UserProfile;
import com.gamer.gamer_backend.service.BlogService;
import com.gamer.gamer_backend.service.UserProfileService;

import java.util.List;
import java.util.Optional;

/**
 * BlogController
 * - Handles CRUD operations for blogs
 * - Maps requests to /api/blogs
 * - Supports CORS for frontend running on localhost:3000
 */
@RestController
@RequestMapping("/api/blogs")
@CrossOrigin(origins = "http://localhost:3000")
public class BlogController {

    private final BlogService blogService;
    private final UserProfileService userProfileService;

    // Constructor injection for services
    public BlogController(BlogService blogService, UserProfileService userProfileService) {
        this.blogService = blogService;
        this.userProfileService = userProfileService;
    }

    /**
     * Create a new blog
     * - Fetches the user's profile to set userName and userImage
     * - Returns the created blog
     */
    @PostMapping("/create")
    public Blog createBlog(@RequestBody Blog blog) {
        Optional<UserProfile> profileOptional = userProfileService.getProfileByEmail(blog.getEmail());

        if (profileOptional.isPresent()) {
            UserProfile profile = profileOptional.get();
            blog.setUserName(profile.getGamerName());
            blog.setUserImage(profile.getImageUrl());
        }
        return blogService.createBlog(blog);
    }

    /**
     * Get all blogs
     * - Returns a list of all blogs
     */
    @GetMapping("/all")
    public List<Blog> getAllBlogs() {
        return blogService.getAllBlogs();
    }

    /**
     * Get a single blog by ID
     * - Returns 200 OK if found, 404 Not Found if not
     */
    @GetMapping("/{id}")
    public ResponseEntity<Blog> getBlogById(@PathVariable String id) {
        Optional<Blog> blog = blogService.getBlogById(id);
        return blog.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * Get all blogs by a specific user
     * - Returns a list of blogs filtered by user email
     */
    @GetMapping("/user/{email}")
    public List<Blog> getUserBlogs(@PathVariable String email) {
        return blogService.getBlogsByEmail(email);
    }

    /**
     * Edit/update an existing blog
     * - Takes blog ID and updated blog content
     * - Returns the updated blog
     */
    @PutMapping("/edit/{id}")
    public Blog editBlog(@PathVariable String id, @RequestBody Blog updatedBlog) {
        return blogService.updateBlog(id, updatedBlog);
    }

    /**
     * Delete a blog by ID
     */
    @DeleteMapping("/delete/{id}")
    public void deleteBlog(@PathVariable String id) {
        blogService.deleteBlog(id);
    }
}
