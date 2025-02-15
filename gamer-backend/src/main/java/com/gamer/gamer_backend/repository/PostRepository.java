package com.gamer.gamer_backend.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.gamer.gamer_backend.models.Post;

public interface PostRepository extends MongoRepository<Post, String> {
}
