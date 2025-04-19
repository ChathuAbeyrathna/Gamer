package com.gamer.gamer_backend.controller;

import com.gamer.gamer_backend.models.SavedPost;
import com.gamer.gamer_backend.service.SavedPostService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/saved-posts")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class SavedPostController {

    private final SavedPostService service;

    @PostMapping("/toggle/{postId}")
    public boolean toggleSave(@PathVariable String postId, Principal principal) {
        return service.toggleSave(principal.getName(), postId);
    }

    @GetMapping
    public List<SavedPost> getSavedPosts(Principal principal) {
        return service.getSavedPosts(principal.getName());
    }

    @DeleteMapping("/{postId}")
    public void unsavePost(@PathVariable String postId, Principal principal) {
        service.unsavePost(principal.getName(), postId);
    }
 
}
