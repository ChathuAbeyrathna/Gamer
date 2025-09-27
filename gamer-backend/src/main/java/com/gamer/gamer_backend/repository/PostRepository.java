package com.gamer.gamer_backend.repository;

import com.gamer.gamer_backend.models.Post;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface PostRepository extends MongoRepository<Post, String> {

    // Find all posts created by a specific user
    List<Post> findByEmail(String email);

    // Find all posts belonging to a specific group
    List<Post> findByGroupId(String groupId);

    // Find all posts that are associated with any group (non-null groupId)
    List<Post> findByGroupIdNotNull();
}
