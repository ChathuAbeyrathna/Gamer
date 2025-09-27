package com.gamer.gamer_backend.service;

import org.springframework.stereotype.Service;

import com.gamer.gamer_backend.models.Post;
import com.gamer.gamer_backend.repository.PostRepository;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Service class for managing Posts.
 * Provides CRUD operations, profile info updates, and filtering logic
 * for posts inside/outside groups.
 */
@Service
public class PostService {

    private final PostRepository postRepository;

    // Constructor-based dependency injection (recommended over field injection)
    public PostService(PostRepository postRepository) {
        this.postRepository = postRepository;
    }

    /**
     * Create and save a new post.
     *
     * @param post Post object to be created.
     * @return The saved post.
     */
    public Post createPost(Post post) {
        return postRepository.save(post);
    }

    /**
     * Fetch a single post by its ID.
     *
     * @param id The post ID.
     * @return Optional containing the post if found, otherwise empty.
     */
    public Optional<Post> getPostById(String id) {
        return postRepository.findById(id);
    }

    /**
     * Get all global posts (not belonging to any group).
     * Filters out posts that are tied to a group.
     *
     * @return List of posts where groupId is null.
     */
    public List<Post> getAllPosts() {
        return postRepository.findAll().stream()
                .filter(post -> post.getGroupId() == null) // exclude group-specific posts
                .collect(Collectors.toList());
    }

    /**
     * Fetch all posts created by a specific user.
     *
     * @param email User's email.
     * @return List of posts authored by the user.
     */
    public List<Post> getPostsByEmail(String email) {
        return postRepository.findByEmail(email);
    }

    /**
     * Update user profile details (name & image) across all of their posts.
     * This keeps existing posts consistent if the user updates their profile.
     *
     * @param email       User's email (identifier).
     * @param newName     Updated gamer name.
     * @param newImageUrl Updated profile image URL.
     */
    public void updatePostsWithNewProfileInfo(String email, String newName, String newImageUrl) {
        List<Post> posts = postRepository.findByEmail(email);
        for (Post post : posts) {
            post.setUserName(newName);
            post.setUserImage(newImageUrl);
            postRepository.save(post); // persist updated values
        }
    }

    /**
     * Update an existing post (title, image, tags).
     *
     * @param id          Post ID to update.
     * @param updatedPost Object containing new values.
     * @return Updated post if found, otherwise null.
     */
    public Post updatePost(String id, Post updatedPost) {
        return postRepository.findById(id).map(post -> {
            post.setTitle(updatedPost.getTitle());
            post.setImageUrl(updatedPost.getImageUrl());
            post.setTags(updatedPost.getTags());
            return postRepository.save(post);
        }).orElse(null);
    }

    /**
     * Delete a post by its ID.
     *
     * @param id Post ID.
     */
    public void deletePost(String id) {
        postRepository.deleteById(id);
    }
}
