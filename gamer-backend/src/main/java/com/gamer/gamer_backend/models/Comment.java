package com.gamer.gamer_backend.models;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Document(collection = "comments")
public class Comment {
    @Id
    private String id;

    private String postId;   // link comment to post
    private String email;    // comment author email

    private String content;
    private Instant createdAt;

    // Optionally you can store username and image here for quick access
    private String userName;
    private String userImage;
}
