package com.gamer.gamer_backend.repository;

import com.gamer.gamer_backend.models.Group;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface GroupRepository extends MongoRepository<Group, String> {

    // Find all groups created by a specific owner
    List<Group> findByOwnerEmail(String email);

    // Find all groups where a specific user is a member
    List<Group> findByMemberEmailsContaining(String email);
}
