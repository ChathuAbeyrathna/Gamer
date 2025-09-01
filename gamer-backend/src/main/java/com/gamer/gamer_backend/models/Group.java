package com.gamer.gamer_backend.models;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.List;

@Document(collection = "groups")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Group {
    @Id
    private String id;
    private String name;
    private String description;
    private String coverPhotoUrl;
    private String ownerEmail;
    private List<String> tags;
    private List<String> memberEmails; 
}
