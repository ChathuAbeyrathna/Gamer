package com.gamer.gamer_backend.controller;

import com.gamer.gamer_backend.models.SavedBlog;
import com.gamer.gamer_backend.service.SavedBlogService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/saved-blogs")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class SavedBlogController {

    private final SavedBlogService service;

    @PostMapping("/toggle/{blogId}")
    public boolean toggleSave(@PathVariable String blogId, Principal principal) {
        return service.toggleSave(principal.getName(), blogId);
    }

    @GetMapping
    public List<SavedBlog> getSavedBlogs(Principal principal) {
        return service.getSavedBlogs(principal.getName());
    }

    @DeleteMapping("/{blogId}")
    public void unsaveBlog(@PathVariable String blogId, Principal principal) {
        service.unsaveBlog(principal.getName(), blogId);
    }

}
