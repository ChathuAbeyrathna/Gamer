package com.gamer.gamer_backend.repository;

import com.gamer.gamer_backend.models.FollowInfo;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface FollowInfoRepository extends MongoRepository<FollowInfo, String> {

    // Find follow information for a specific user by email
    Optional<FollowInfo> findByEmail(String email);
}
