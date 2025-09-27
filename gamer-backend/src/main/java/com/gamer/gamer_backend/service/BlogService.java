package com.gamer.gamer_backend.service;

import org.springframework.stereotype.Service;
import com.gamer.gamer_backend.models.Blog;
import com.gamer.gamer_backend.repository.BlogRepository;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * BlogService
 * - Handles all business logic related to Blog entities
 * - Provides CRUD operations and profile update propagation
 */
@Service
public class BlogService {

    private final BlogRepository blogRepository;

    // Constructor injection for better testability
    public BlogService(BlogRepository blogRepository) {
        this.blogRepository = blogRepository;
    }

    /**
     * Create a new blog
     */
    public Blog createBlog(Blog blog) {
        return blogRepository.save(blog);
    }

    /**
     * Get all blogs that are not associated with any group
     */
    public List<Blog> getAllBlogs() {
        return blogRepository.findAll().stream()
                .filter(blog -> blog.getGroupId() == null)
                .collect(Collectors.toList());
    }

    /**
     * Get a blog by its ID
     */
    public Optional<Blog> getBlogById(String id) {
        return blogRepository.findById(id);
    }

    /**
     * Get all blogs created by a specific user
     */
    public List<Blog> getBlogsByEmail(String email) {
        return blogRepository.findByEmail(email);
    }

    /**
     * Update all blogs of a user when their profile information changes
     * - Updates userName and userImage in each blog
     */
    public void updateBlogsWithNewProfileInfo(String email, String newName, String newImageUrl) {
        List<Blog> blogs = blogRepository.findByEmail(email);
        for (Blog blog : blogs) {
            blog.setUserName(newName);
            blog.setUserImage(newImageUrl);
            blogRepository.save(blog);
        }
    }

    /**
     * Update an existing blog
     * - Returns the updated blog or null if not found
     */
    public Blog updateBlog(String id, Blog updatedBlog) {
        return blogRepository.findById(id).map(blog -> {
            blog.setTitle(updatedBlog.getTitle());
            blog.setContent(updatedBlog.getContent());
            blog.setImageUrl(updatedBlog.getImageUrl());
            blog.setTags(updatedBlog.getTags());
            return blogRepository.save(blog);
        }).orElse(null);
    }

    /**
     * Delete a blog by ID
     */
    public void deleteBlog(String id) {
        blogRepository.deleteById(id);
    }
}
