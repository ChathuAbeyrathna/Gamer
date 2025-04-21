package com.gamer.gamer_backend.service;

import org.springframework.stereotype.Service;
import com.gamer.gamer_backend.models.Blog;
import com.gamer.gamer_backend.repository.BlogRepository;

import java.util.List;
import java.util.Optional;

@Service
public class BlogService {

    private final BlogRepository blogRepository;

    public BlogService(BlogRepository blogRepository) {
        this.blogRepository = blogRepository;
    }

    public Blog createBlog(Blog blog) {
        return blogRepository.save(blog);
    }

    public List<Blog> getAllBlogs() {
        return blogRepository.findAll();
    }

    public Optional<Blog> getBlogById(String id) {
        return blogRepository.findById(id);
    }

    public List<Blog> getBlogsByEmail(String email) {
        return blogRepository.findByEmail(email);
    }

    public void updateBlogsWithNewProfileInfo(String email, String newName, String newImageUrl) {
        List<Blog> blogs = blogRepository.findByEmail(email);
        for (Blog blog : blogs) {
            blog.setUserName(newName);
            blog.setUserImage(newImageUrl);
            blogRepository.save(blog);
        }
    }

    public Blog updateBlog(String id, Blog updatedBlog) {
    return blogRepository.findById(id).map(blog -> {
        blog.setTitle(updatedBlog.getTitle());
        blog.setImageUrl(updatedBlog.getImageUrl());
        blog.setTags(updatedBlog.getTags());
        return blogRepository.save(blog);
    }).orElse(null);
    }

    public void deleteBlog(String id) {
        blogRepository.deleteById(id);
    }
}
