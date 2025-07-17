package com.gamer.gamer_backend.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.gamer.gamer_backend.models.Post;

import java.util.List;

public interface PostRepository extends MongoRepository<Post, String> {
    List<Post> findByEmail(String email);
    List<Post> findByGroupId(String groupId);
    List<Post> findByGroupIdNotNull();
}