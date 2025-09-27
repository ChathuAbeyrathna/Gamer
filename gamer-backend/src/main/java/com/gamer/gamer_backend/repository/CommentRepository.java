package com.gamer.gamer_backend.repository;

import com.gamer.gamer_backend.models.Comment;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface CommentRepository extends MongoRepository<Comment, String> {

    // Get all top-level comments (no parent) for a specific post, ordered by creation time
    List<Comment> findByPostIdAndParentCommentIdIsNullOrderByCreatedAtAsc(String postId);

    // Get all replies for a specific parent comment, ordered by creation time
    List<Comment> findByParentCommentIdOrderByCreatedAtAsc(String parentCommentId);
}
