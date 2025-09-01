package com.gamer.gamer_backend.models;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.Instant;

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
    private Instant savedAt;
}
