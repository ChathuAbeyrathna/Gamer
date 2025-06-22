package com.gamer.gamer_backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.gamer.gamer_backend.models.Group;
import com.gamer.gamer_backend.service.GroupService;

import java.util.List;

@RestController
@RequestMapping("/api/groups")
@CrossOrigin(origins = "*")
public class GroupController {

    @Autowired
    private GroupService groupService;

    @PostMapping
    public ResponseEntity<Group> createGroup(@RequestBody Group group) {
        return ResponseEntity.ok(groupService.createGroup(group));
    }

    @GetMapping
    public ResponseEntity<List<Group>> getAllGroups() {
        return ResponseEntity.ok(groupService.getAllGroups());
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
}
