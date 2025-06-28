package com.gamer.gamer_backend.models;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

@Data
@Document(collection = "comments")
public class Comment {
    @Id
    private String id;

    private String postId;        // The post this comment belongs to
    private String parentCommentId; // null if top-level comment, else reply's parent comment id

    private String email;
    private String userName;
    private String userImage;

    private String content;
    private Instant createdAt;

    private List<Comment> replies;  // To hold nested replies (optional for MongoDB embedding)
}
