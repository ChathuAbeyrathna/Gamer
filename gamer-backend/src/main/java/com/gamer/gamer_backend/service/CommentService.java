package com.gamer.gamer_backend.service;

import com.gamer.gamer_backend.models.Comment;
import com.gamer.gamer_backend.models.UserProfile;
import com.gamer.gamer_backend.repository.CommentRepository;
import com.gamer.gamer_backend.repository.UserProfileRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
public class CommentService {

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private UserProfileRepository userProfileRepository;

    // Save comment with user info filled from UserProfile
    public Comment createComment(Comment comment) {
        comment.setCreatedAt(Instant.now());

        UserProfile profile = userProfileRepository.findByEmail(comment.getEmail()).orElse(null);
        if (profile != null) {
            comment.setUserName(profile.getGamerName());
            comment.setUserImage(profile.getImageUrl());
        }
        return commentRepository.save(comment);
    }

    // Get comments for a post
    public List<Comment> getCommentsByPostId(String postId) {
        return commentRepository.findByPostIdOrderByCreatedAtAsc(postId);
    }
}
