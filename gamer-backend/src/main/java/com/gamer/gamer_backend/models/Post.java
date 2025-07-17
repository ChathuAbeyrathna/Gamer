package com.gamer.gamer_backend.models;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Document(collection = "posts")
public class Post {
    @Id
    private String id;
    private String email;         
    private String userName;      
    private String userImage;    
    private String title;
    private String imageUrl;
    private String[] tags;
    private Instant createdAt = Instant.now();
    private String groupId; 
}