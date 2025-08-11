package com.gamer.gamer_backend.models;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "notifications")
public class Notification {
    @Id
    private String id;

    private String senderId;     // who did the action (email)
    private String receiverId;   // who receives it (email)
    private String type;         // "BOOST", "COMMENT", "FOLLOW"
    private String postId;       // id of post or blog that got boosted/commented
    private String message;
    private boolean read;
    private LocalDateTime createdAt;
    
    private String senderName;    // added
    private String senderImageUrl; // added
}
