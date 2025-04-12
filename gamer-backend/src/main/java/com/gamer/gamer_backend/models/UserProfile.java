package com.gamer.gamer_backend.models;

import lombok.*;

import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "user_profiles")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserProfile {
    @Id
    private String id;
    private String email;
    private String gamerName;
    private String bio;
    private List<String> role;
    private String imageUrl;
}
