package com.gamer.gamer_backend.service;

import org.springframework.stereotype.Service;
import com.gamer.gamer_backend.models.Post;
import com.gamer.gamer_backend.repository.PostRepository;

import java.util.List;

@Service
public class PostService {
    private final PostRepository postRepository;

    public PostService(PostRepository postRepository) {
        this.postRepository = postRepository;
    }

    public Post createPost(Post post) {
        return postRepository.save(post);
    }

    public List<Post> getAllPosts() {
        return postRepository.findAll();
    }
}