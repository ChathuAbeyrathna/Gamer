package com.gamer.gamer_backend.repository;

import com.gamer.gamer_backend.models.Boost;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface BoostRepository extends MongoRepository<Boost, String> {
    Optional<Boost> findByUserEmailAndPostId(String userEmail, String postId);

    List<Boost> findByPostId(String postId);

    void deleteByUserEmailAndPostId(String userEmail, String postId);
}
