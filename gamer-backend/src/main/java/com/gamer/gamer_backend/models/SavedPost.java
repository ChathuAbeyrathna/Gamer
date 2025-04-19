package com.gamer.gamer_backend.models;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "saved_posts")
public class SavedPost {
    @Id
    private String id;
    private String userEmail;
    private String postId;
}

