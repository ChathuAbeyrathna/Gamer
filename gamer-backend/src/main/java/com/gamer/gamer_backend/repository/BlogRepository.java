package com.gamer.gamer_backend.repository;

import com.gamer.gamer_backend.models.Blog;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface BlogRepository extends MongoRepository<Blog, String> {
    List<Blog> findByEmail(String email);
    List<Blog> findByGroupId(String groupId);
}
