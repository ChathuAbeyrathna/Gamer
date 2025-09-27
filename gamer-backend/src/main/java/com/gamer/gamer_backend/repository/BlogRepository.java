package com.gamer.gamer_backend.repository;

import com.gamer.gamer_backend.models.Blog;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface BlogRepository extends MongoRepository<Blog, String> {

    // Find all blogs created by a specific user
    List<Blog> findByEmail(String email);

    // Find all blogs belonging to a specific group
    List<Blog> findByGroupId(String groupId);

    // Find all blogs that are associated with any group (non-null groupId)
    List<Blog> findByGroupIdNotNull();
}
