package com.gamer.gamer_backend.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.gamer.gamer_backend.models.Group;

import java.util.List;

public interface GroupRepository extends MongoRepository<Group, String> {
    List<Group> findByOwnerEmail(String email);
    List<Group> findByMemberEmailsContaining(String email);
}

