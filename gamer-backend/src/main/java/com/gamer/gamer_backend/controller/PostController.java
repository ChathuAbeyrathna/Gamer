package com.gamer.gamer_backend.controller;

import org.springframework.web.bind.annotation.*;
import com.gamer.gamer_backend.models.Post;
import com.gamer.gamer_backend.models.UserProfile;
import com.gamer.gamer_backend.service.PostService;
import com.gamer.gamer_backend.service.UserProfileService;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/posts")
@CrossOrigin(origins = "http://localhost:3000")
public class PostController {

    private final PostService postService;
    private final UserProfileService userProfileService;

    public PostController(PostService postService, UserProfileService userProfileService) {
        this.postService = postService;
        this.userProfileService = userProfileService;
    }

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

    @GetMapping("/all")
    public List<Post> getAllPosts() {
        return postService.getAllPosts();
    }

    @GetMapping("/user/{email}")
    public List<Post> getUserPosts(@PathVariable String email) {
        return postService.getPostsByEmail(email);
    }

    @PutMapping("/edit/{id}")
    public Post editPost(@PathVariable String id, @RequestBody Post updatedPost) {
        return postService.updatePost(id, updatedPost);
    }

    @DeleteMapping("/delete/{id}")
    public void deletePost(@PathVariable String id) {
        postService.deletePost(id);
    }

}
