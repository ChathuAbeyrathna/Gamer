package com.gamer.gamer_backend.models;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "chats")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Chat {
    @Id
    private String id;
    private String senderEmail;
    private String receiverEmail;
    private String message;
    private Instant timestamp = Instant.now();
    private boolean read = false; // track unread
}
