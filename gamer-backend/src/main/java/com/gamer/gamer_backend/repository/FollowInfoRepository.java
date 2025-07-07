package com.gamer.gamer_backend.repository;

import com.gamer.gamer_backend.models.FollowInfo;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface FollowInfoRepository extends MongoRepository<FollowInfo, String> {
    Optional<FollowInfo> findByEmail(String email);
}
