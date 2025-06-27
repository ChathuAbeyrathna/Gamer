package com.gamer.gamer_backend.controller;

import com.gamer.gamer_backend.models.Comment;
import com.gamer.gamer_backend.service.CommentService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/comments")
@CrossOrigin(origins = "http://localhost:3000")
public class CommentController {

    @Autowired
    private CommentService commentService;

    // Add comment
    @PostMapping("/add")
    public Comment addComment(@RequestBody Comment comment) {
        return commentService.createComment(comment);
    }

    // Get all comments by post id
    @GetMapping("/post/{postId}")
    public List<Comment> getCommentsByPostId(@PathVariable String postId) {
        return commentService.getCommentsByPostId(postId);
    }
}
