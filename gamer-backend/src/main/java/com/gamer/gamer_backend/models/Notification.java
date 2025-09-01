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

    private String senderId;
    private String receiverId;
    private String type;
    private String postId;
    private String message;
    private boolean read;
    private LocalDateTime createdAt;

    private String senderName;
    private String senderImageUrl;
}
