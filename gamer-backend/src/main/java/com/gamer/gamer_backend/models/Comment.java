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

    private String postId;
    private String parentCommentId;

    private String email;
    private String userName;
    private String userImage;

    private String content;
    private Instant createdAt;

    private List<Comment> replies;
}
