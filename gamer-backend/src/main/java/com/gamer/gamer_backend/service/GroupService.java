package com.gamer.gamer_backend.service;

import com.gamer.gamer_backend.models.Group;
import com.gamer.gamer_backend.models.Post;
import com.gamer.gamer_backend.models.Blog;
import com.gamer.gamer_backend.repository.GroupRepository;
import com.gamer.gamer_backend.repository.PostRepository;
import com.gamer.gamer_backend.repository.BlogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class GroupService {

    @Autowired
    private GroupRepository groupRepo;

    @Autowired
    private PostRepository postRepo;

    @Autowired
    private BlogRepository blogRepo;

    public Group createGroup(Group group) {
        return groupRepo.save(group);
    }

    public List<Group> getGroupsForUser(String email) {
        return groupRepo.findByMemberEmailsContaining(email);
    }

    public Group getGroupById(String groupId) {
        return groupRepo.findById(groupId).orElseThrow(() -> new RuntimeException("Group not found"));
    }

    public Group joinGroup(String groupId, String email) {
        Group group = getGroupById(groupId);
        if (!group.getMemberEmails().contains(email)) {
            group.getMemberEmails().add(email);
            return groupRepo.save(group);
        }
        return group;
    }

    public Group leaveGroup(String groupId, String email) {
        Group group = getGroupById(groupId);
        if (group.getOwnerEmail().equals(email)) {
            throw new RuntimeException("Owner cannot leave their own group");
        }
        group.getMemberEmails().remove(email);
        return groupRepo.save(group);
    }

    public Group updateGroup(String groupId, Group updatedGroup) {
        Group group = getGroupById(groupId);
        group.setName(updatedGroup.getName());
        group.setDescription(updatedGroup.getDescription());
        group.setCoverPhotoUrl(updatedGroup.getCoverPhotoUrl());
        group.setTags(updatedGroup.getTags());
        return groupRepo.save(group);
    }

    public void deleteGroup(String groupId, String email) {
        Group group = getGroupById(groupId);
        if (!group.getOwnerEmail().equals(email)) {
            throw new RuntimeException("Only the group owner can delete the group");
        }
        groupRepo.delete(group);
    }

    public List<Group> getGroupsOwnedByUser(String email) {
        return groupRepo.findByOwnerEmail(email);
    }

    public List<Group> getAllGroups() {
        return groupRepo.findAll();
    }

    public List<Post> getPostsByGroup(String groupId) {
        return postRepo.findByGroupId(groupId);
    }

    public List<Blog> getBlogsByGroup(String groupId) {
        return blogRepo.findByGroupId(groupId);
    }
}
