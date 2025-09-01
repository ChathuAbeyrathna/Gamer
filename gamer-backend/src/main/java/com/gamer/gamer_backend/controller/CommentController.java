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
    private NotificationService notificationService;

    // Add new top-level comment
    @PostMapping("/add")
    public Comment addComment(@RequestBody Comment comment) {
        Comment saved = commentService.createComment(comment);

        // Notify post owner if not commenting on own post
        String postOwnerId = commentService.getPostOwnerId(saved.getPostId());
        if (postOwnerId != null && !postOwnerId.equals(saved.getEmail())) {
            notificationService.sendNotification(
                    saved.getEmail(),
                    postOwnerId,
                    "COMMENT",
                    saved.getPostId(),
                    "commented on your post");
        }

        return saved;
    }

    // Add reply to comment
    @PostMapping("/addReply")
    public Comment addReply(@RequestBody Comment reply) {
        Comment saved = commentService.createReply(reply);

        // Notify parent comment author
        String parentCommentAuthor = commentService.getCommentAuthor(reply.getParentCommentId());
        if (parentCommentAuthor != null && !parentCommentAuthor.equals(saved.getEmail())) {
            notificationService.sendNotification(
                    saved.getEmail(),
                    parentCommentAuthor,
                    "COMMENT_REPLY",
                    saved.getPostId(),
                    "replied to your comment");
        }

        // Notify post owner if different from reply author and parent comment author
        String postOwnerId = commentService.getPostOwnerId(saved.getPostId());
        if (postOwnerId != null &&
                !postOwnerId.equals(saved.getEmail()) &&
                !postOwnerId.equals(parentCommentAuthor)) {
            notificationService.sendNotification(
                    saved.getEmail(),
                    postOwnerId,
                    "COMMENT",
                    saved.getPostId(),
                    "replied to a comment on your post");
        }

        return saved;
    }

    // Get comments with nested replies for a post
    @GetMapping("/post/{postId}")
    public List<Comment> getComments(@PathVariable String postId) {
        return commentService.getCommentsWithReplies(postId);
    }

    @PutMapping("/edit/{id}")
    public Comment editComment(@PathVariable String id, @RequestBody Comment updated) {
        return commentService.updateComment(id, updated.getContent());
    }

    @DeleteMapping("/delete/{id}")
    public void deleteComment(@PathVariable String id) {
        commentService.deleteCommentAndReplies(id);
    }
}
