package com.gamer.gamer_backend.repository;

import com.gamer.gamer_backend.models.Comment;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface CommentRepository extends MongoRepository<Comment, String> {
    List<Comment> findByPostIdAndParentCommentIdIsNullOrderByCreatedAtAsc(String postId);

    List<Comment> findByParentCommentIdOrderByCreatedAtAsc(String parentCommentId);
}
