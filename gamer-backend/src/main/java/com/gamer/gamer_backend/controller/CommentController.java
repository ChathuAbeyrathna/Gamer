package com.gamer.gamer_backend.controller;

import com.gamer.gamer_backend.models.Comment;
import com.gamer.gamer_backend.service.CommentService;
import com.gamer.gamer_backend.service.NotificationService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/comments")
@CrossOrigin(origins = "http://localhost:3000")
public class CommentController {

    @Autowired
    private CommentService commentService;

    @Autowired
    private NotificationService notificationService; //  Injected

    // Add new top-level comment
    @PostMapping("/add")
    public Comment addComment(@RequestBody Comment comment) {
        Comment saved = commentService.createComment(comment);

        //  Send notification to post owner
        String receiverId = commentService.getPostOwnerId(saved.getPostId());
        if (receiverId != null && !receiverId.equals(saved.getEmail())) {
            notificationService.sendNotification(
                    saved.getEmail(),
                    receiverId,
                    "COMMENT",
                    saved.getPostId(),
                    "commented on your post"
            );
        }

        return saved;
    }

    // Add reply to comment
    @PostMapping("/addReply")
    public Comment addReply(@RequestBody Comment reply) {
        Comment saved = commentService.createReply(reply);

        //  Send notification to post owner
        String receiverId = commentService.getPostOwnerId(saved.getPostId());
        if (receiverId != null && !receiverId.equals(saved.getEmail())) {
            notificationService.sendNotification(
                    saved.getEmail(),
                    receiverId,
                    "COMMENT",
                    saved.getPostId(),
                    "replied to a comment on your post"
            );
        }

        return saved;
    }

    // Get comments with nested replies for a post
    @GetMapping("/post/{postId}")
    public List<Comment> getComments(@PathVariable String postId) {
        return commentService.getCommentsWithReplies(postId);
    }

    // Edit comment
    @PutMapping("/edit/{id}")
    public Comment editComment(@PathVariable String id, @RequestBody Comment updated) {
        return commentService.updateComment(id, updated.getContent());
    }

    // Delete comment (and replies)
    @DeleteMapping("/delete/{id}")
    public void deleteComment(@PathVariable String id) {
        commentService.deleteCommentAndReplies(id);
    }
}

