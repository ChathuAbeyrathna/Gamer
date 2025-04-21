package com.gamer.gamer_backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.gamer.gamer_backend.models.Blog;
import com.gamer.gamer_backend.models.UserProfile;
import com.gamer.gamer_backend.service.BlogService;
import com.gamer.gamer_backend.service.UserProfileService;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/blogs")
@CrossOrigin(origins = "http://localhost:3000")
public class BlogController {

    private final BlogService blogService;
    private final UserProfileService userProfileService;

    public BlogController(BlogService blogService, UserProfileService userProfileService) {
        this.blogService = blogService;
        this.userProfileService = userProfileService;
    }

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

    @GetMapping("/all")
    public List<Blog> getAllBlogs() {
        return blogService.getAllBlogs();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Blog> getBlogById(@PathVariable String id) {
        Optional<Blog> blog = blogService.getBlogById(id);
        return blog.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/user/{email}")
    public List<Blog> getUserBlogs(@PathVariable String email) {
        return blogService.getBlogsByEmail(email);
    }

    @PutMapping("/edit/{id}")
    public Blog editBlog(@PathVariable String id, @RequestBody Blog updatedBlog) {
        return blogService.updateBlog(id, updatedBlog);
    }

    @DeleteMapping("/delete/{id}")
    public void deleteBlog(@PathVariable String id) {
        blogService.deleteBlog(id);
    }
}
