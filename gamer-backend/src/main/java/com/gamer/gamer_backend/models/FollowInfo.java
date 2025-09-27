package com.gamer.gamer_backend.models;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.HashSet;
import java.util.Set;

/**
 * Represents follow information for a user, including their followers and who they are following.
 */
@Document(collection = "follow_info") 
@Data 
@NoArgsConstructor
@AllArgsConstructor
public class FollowInfo {
    @Id 
    private String id;

    private String email; // User's email address

    // Set of emails/user IDs that this user is following
    private Set<String> following = new HashSet<>();

    // Set of emails/user IDs that follow this user
    private Set<String> followers = new HashSet<>();
}
