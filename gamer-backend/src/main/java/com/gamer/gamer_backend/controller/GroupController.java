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

    @PostMapping
    public ResponseEntity<Group> createGroup(@RequestBody Group group) {
        return ResponseEntity.ok(groupService.createGroup(group));
    }

    @GetMapping
    public ResponseEntity<List<Group>> getAllGroups() {
        return ResponseEntity.ok(groupService.getAllGroups());
    }

    @GetMapping("/{groupId}")
    public ResponseEntity<Group> getGroupById(@PathVariable String groupId) {
        return ResponseEntity.ok(groupService.getGroupById(groupId));
    }

    @GetMapping("/owner/{email}")
    public List<Group> getGroupsOwnedByUser(@PathVariable String email) {
        return groupService.getGroupsOwnedByUser(email);
    }

    @GetMapping("/user/{email}")
    public ResponseEntity<List<Group>> getGroupsForUser(@PathVariable String email) {
        return ResponseEntity.ok(groupService.getGroupsForUser(email));
    }

    @PostMapping("/{groupId}/join")
    public ResponseEntity<Group> joinGroup(@PathVariable String groupId, @RequestParam String email) {
        return ResponseEntity.ok(groupService.joinGroup(groupId, email));
    }

    @PostMapping("/{groupId}/leave")
    public ResponseEntity<Group> leaveGroup(@PathVariable String groupId, @RequestParam String email) {
        return ResponseEntity.ok(groupService.leaveGroup(groupId, email));
    }

    @PutMapping("/{groupId}")
    public ResponseEntity<Group> updateGroup(@PathVariable String groupId, @RequestBody Group updatedGroup) {
        return ResponseEntity.ok(groupService.updateGroup(groupId, updatedGroup));
    }

    @DeleteMapping("/{groupId}")
    public ResponseEntity<String> deleteGroup(@PathVariable String groupId, @RequestParam String email) {
        groupService.deleteGroup(groupId, email);
        return ResponseEntity.ok("Group deleted successfully");
    }

    @GetMapping("/{groupId}/posts")
    public ResponseEntity<List<Post>> getPostsByGroup(@PathVariable String groupId) {
        return ResponseEntity.ok(groupService.getPostsByGroup(groupId));
    }

    @GetMapping("/{groupId}/blogs")
    public ResponseEntity<List<Blog>> getBlogsByGroup(@PathVariable String groupId) {
        return ResponseEntity.ok(groupService.getBlogsByGroup(groupId));
    }

    @GetMapping("/all-posts")
    public ResponseEntity<List<Post>> getAllGroupPosts() {
        List<Post> groupPosts = postRepository.findByGroupIdNotNull();
        return ResponseEntity.ok(groupPosts);
    }

    @GetMapping("/all-blogs")
    public ResponseEntity<List<Blog>> getAllGroupBlogs() {
        List<Blog> groupBlogs = blogRepository.findByGroupIdNotNull();
        return ResponseEntity.ok(groupBlogs);
    }
}
