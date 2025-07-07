package com.gamer.gamer_backend.models;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.HashSet;
import java.util.Set;

@Document(collection = "follow_info")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FollowInfo {
    @Id
    private String id;

    private String email;

    private Set<String> following = new HashSet<>();
    private Set<String> followers = new HashSet<>();
}
