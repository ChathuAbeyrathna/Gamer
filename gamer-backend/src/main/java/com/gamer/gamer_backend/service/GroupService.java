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

    // Creates a new group and saves it to the repository
    public Group createGroup(Group group) {
        return groupRepo.save(group);
    }

    // Retrieves all groups where the user is a member
    public List<Group> getGroupsForUser(String email) {
        return groupRepo.findByMemberEmailsContaining(email);
    }

    // Gets a group by its ID, throws exception if not found
    public Group getGroupById(String groupId) {
        return groupRepo.findById(groupId).orElseThrow(() -> new RuntimeException("Group not found"));
    }

    // Adds a user to the group's member list if not already present
    public Group joinGroup(String groupId, String email) {
        Group group = getGroupById(groupId);
        if (!group.getMemberEmails().contains(email)) {
            group.getMemberEmails().add(email);
            return groupRepo.save(group);
        }
        return group;
    }

    // Removes a user from the group's member list, owner cannot leave their own group
    public Group leaveGroup(String groupId, String email) {
        Group group = getGroupById(groupId);
        if (group.getOwnerEmail().equals(email)) {
            throw new RuntimeException("Owner cannot leave their own group");
        }
        group.getMemberEmails().remove(email);
        return groupRepo.save(group);
    }

    // Updates group details with the provided updated group information
    public Group updateGroup(String groupId, Group updatedGroup) {
        Group group = getGroupById(groupId);
        group.setName(updatedGroup.getName());
        group.setDescription(updatedGroup.getDescription());
        group.setCoverPhotoUrl(updatedGroup.getCoverPhotoUrl());
        group.setTags(updatedGroup.getTags());
        return groupRepo.save(group);
    }

    // Deletes a group if the requesting user is the owner
    public void deleteGroup(String groupId, String email) {
        Group group = getGroupById(groupId);
        if (!group.getOwnerEmail().equals(email)) {
            throw new RuntimeException("Only the group owner can delete the group");
        }
        groupRepo.delete(group);
    }

    // Retrieves all groups owned by the specified user
    public List<Group> getGroupsOwnedByUser(String email) {
        return groupRepo.findByOwnerEmail(email);
    }

    // Retrieves all groups from the repository
    public List<Group> getAllGroups() {
        return groupRepo.findAll();
    }

    // Gets all posts associated with a specific group
    public List<Post> getPostsByGroup(String groupId) {
        return postRepo.findByGroupId(groupId);
    }

    // Gets all blogs associated with a specific group
    public List<Blog> getBlogsByGroup(String groupId) {
        return blogRepo.findByGroupId(groupId);
    }
}
