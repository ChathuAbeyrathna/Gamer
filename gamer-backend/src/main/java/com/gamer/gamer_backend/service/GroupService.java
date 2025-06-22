package com.gamer.gamer_backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.gamer.gamer_backend.models.Group;
import com.gamer.gamer_backend.repository.GroupRepository;

import java.util.List;

@Service
public class GroupService {

    @Autowired
    private GroupRepository groupRepo;

    public Group createGroup(Group group) {
        return groupRepo.save(group);
    }

    public List<Group> getGroupsForUser(String email) {
        return groupRepo.findByMemberEmailsContaining(email);
    }

    public Group joinGroup(String groupId, String email) {
        Group group = groupRepo.findById(groupId).orElseThrow();
        if (!group.getMemberEmails().contains(email)) {
            group.getMemberEmails().add(email);
            return groupRepo.save(group);
        }
        return group;
    }

    public List<Group> getGroupsOwnedByUser(String email) {
    return groupRepo.findByOwnerEmail(email);
    }

    public List<Group> getAllGroups() {
        return groupRepo.findAll();
    }
}
