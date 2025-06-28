package com.gamer.gamer_backend.service;

import com.gamer.gamer_backend.models.Comment;
import com.gamer.gamer_backend.models.UserProfile;
import com.gamer.gamer_backend.repository.CommentRepository;
import com.gamer.gamer_backend.repository.UserProfileRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service
public class CommentService {

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private UserProfileRepository userProfileRepository;

    // Create new comment (top-level)
    public Comment createComment(Comment comment) {
        comment.setCreatedAt(Instant.now());

        if (comment.getEmail() != null) {
            UserProfile profile = userProfileRepository.findByEmail(comment.getEmail()).orElse(null);
            if (profile != null) {
                comment.setUserName(profile.getGamerName());
                comment.setUserImage(profile.getImageUrl());
            }
        }

        comment.setParentCommentId(null); // top-level comment
        return commentRepository.save(comment);
    }

    // Create a reply to a comment
    public Comment createReply(Comment reply) {
        reply.setCreatedAt(Instant.now());

        if (reply.getEmail() != null) {
            UserProfile profile = userProfileRepository.findByEmail(reply.getEmail()).orElse(null);
            if (profile != null) {
                reply.setUserName(profile.getGamerName());
                reply.setUserImage(profile.getImageUrl());
            }
        }

        if (reply.getParentCommentId() == null) {
            throw new IllegalArgumentException("Reply must have a parentCommentId");
        }

        return commentRepository.save(reply);
    }

    // Get all top-level comments for a post, with nested replies
    public List<Comment> getCommentsWithReplies(String postId) {
        List<Comment> topComments = commentRepository.findByPostIdAndParentCommentIdIsNullOrderByCreatedAtAsc(postId);

        // For each top-level comment, fetch its replies recursively
        for (Comment c : topComments) {
            c.setReplies(getRepliesRecursive(c.getId()));
        }
        return topComments;
    }

    // Recursive method to get replies for a comment
    private List<Comment> getRepliesRecursive(String parentCommentId) {
        List<Comment> replies = commentRepository.findByParentCommentIdOrderByCreatedAtAsc(parentCommentId);

        for (Comment r : replies) {
            r.setReplies(getRepliesRecursive(r.getId()));
        }
        return replies;
    }

    // Edit comment content
    public Comment updateComment(String id, String newContent) {
        Optional<Comment> opt = commentRepository.findById(id);
        if (opt.isEmpty()) {
            throw new RuntimeException("Comment not found");
        }
        Comment comment = opt.get();
        comment.setContent(newContent);
        return commentRepository.save(comment);
    }

    // Delete comment (and optionally delete all replies recursively)
    public void deleteCommentAndReplies(String id) {
        // delete replies first recursively
        List<Comment> replies = commentRepository.findByParentCommentIdOrderByCreatedAtAsc(id);
        for (Comment reply : replies) {
            deleteCommentAndReplies(reply.getId());
        }

        // delete the comment itself
        commentRepository.deleteById(id);
    }
}
