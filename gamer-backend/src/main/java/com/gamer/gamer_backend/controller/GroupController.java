package com.gamer.gamer_backend.controller;

import com.gamer.gamer_backend.models.Group;
import com.gamer.gamer_backend.models.Post;
import com.gamer.gamer_backend.repository.PostRepository;
import com.gamer.gamer_backend.models.Blog;
import com.gamer.gamer_backend.repository.BlogRepository;
import com.gamer.gamer_backend.service.GroupService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for managing groups, their posts, and blogs.
 */
@RestController
@RequestMapping("/api/groups")
@CrossOrigin(origins = "http://localhost:3000")
public class GroupController {

    @Autowired
    private GroupService groupService;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private BlogRepository blogRepository;

    /**
     * Create a new group.
     */
    @PostMapping
    public ResponseEntity<Group> createGroup(@RequestBody Group group) {
        return ResponseEntity.ok(groupService.createGroup(group));
    }

    /**
     * Get all groups.
     */
    @GetMapping
    public ResponseEntity<List<Group>> getAllGroups() {
        return ResponseEntity.ok(groupService.getAllGroups());
    }

    /**
     * Get a group by its ID.
     */
    @GetMapping("/{groupId}")
    public ResponseEntity<Group> getGroupById(@PathVariable String groupId) {
        return ResponseEntity.ok(groupService.getGroupById(groupId));
    }

    /**
     * Get groups owned by a specific user.
     */
    @GetMapping("/owner/{email}")
    public List<Group> getGroupsOwnedByUser(@PathVariable String email) {
        return groupService.getGroupsOwnedByUser(email);
    }

    /**
     * Get groups a user is a member of.
     */
    @GetMapping("/user/{email}")
    public ResponseEntity<List<Group>> getGroupsForUser(@PathVariable String email) {
        return ResponseEntity.ok(groupService.getGroupsForUser(email));
    }

    /**
     * Join a group.
     */
    @PostMapping("/{groupId}/join")
    public ResponseEntity<Group> joinGroup(@PathVariable String groupId, @RequestParam String email) {
        return ResponseEntity.ok(groupService.joinGroup(groupId, email));
    }

    /**
     * Leave a group.
     */
    @PostMapping("/{groupId}/leave")
    public ResponseEntity<Group> leaveGroup(@PathVariable String groupId, @RequestParam String email) {
        return ResponseEntity.ok(groupService.leaveGroup(groupId, email));
    }

    /**
     * Update a group's details.
     */
    @PutMapping("/{groupId}")
    public ResponseEntity<Group> updateGroup(@PathVariable String groupId, @RequestBody Group updatedGroup) {
        return ResponseEntity.ok(groupService.updateGroup(groupId, updatedGroup));
    }

    /**
     * Delete a group.
     */
    @DeleteMapping("/{groupId}")
    public ResponseEntity<String> deleteGroup(@PathVariable String groupId, @RequestParam String email) {
        groupService.deleteGroup(groupId, email);
        return ResponseEntity.ok("Group deleted successfully");
    }

    /**
     * Get posts belonging to a group.
     */
    @GetMapping("/{groupId}/posts")
    public ResponseEntity<List<Post>> getPostsByGroup(@PathVariable String groupId) {
        return ResponseEntity.ok(groupService.getPostsByGroup(groupId));
    }

    /**
     * Get blogs belonging to a group.
     */
    @GetMapping("/{groupId}/blogs")
    public ResponseEntity<List<Blog>> getBlogsByGroup(@PathVariable String groupId) {
        return ResponseEntity.ok(groupService.getBlogsByGroup(groupId));
    }

    /**
     * Get all posts that belong to any group.
     */
    @GetMapping("/all-posts")
    public ResponseEntity<List<Post>> getAllGroupPosts() {
        List<Post> groupPosts = postRepository.findByGroupIdNotNull();
        return ResponseEntity.ok(groupPosts);
    }

    /**
     * Get all blogs that belong to any group.
     */
    @GetMapping("/all-blogs")
    public ResponseEntity<List<Blog>> getAllGroupBlogs() {
        List<Blog> groupBlogs = blogRepository.findByGroupIdNotNull();
        return ResponseEntity.ok(groupBlogs);
    }
}
