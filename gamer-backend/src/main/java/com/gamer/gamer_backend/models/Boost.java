package com.gamer.gamer_backend.models;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "boosts")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Boost {
    @Id
    private String id;

    private String postId;
    private String userEmail;
    private String userName;
    private String userImage;
}
