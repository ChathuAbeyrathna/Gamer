package com.gamer.gamer_backend.controller;

import com.gamer.gamer_backend.models.Post;
import com.gamer.gamer_backend.models.Blog;
import com.gamer.gamer_backend.models.Group;
import com.gamer.gamer_backend.models.UserProfile;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;

import java.util.*;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class SearchController {

    private final MongoTemplate mongoTemplate;

    @GetMapping
    public Map<String, Object> search(@RequestParam String query) {
        Map<String, Object> results = new HashMap<>();

        if (query == null || query.trim().isEmpty()) {
            return results;
        }

        // Normalize query and create regex with optional "s" for singular/plural match
        String normalizedQuery = query.trim();
        String regex = "(?i).*" + normalizedQuery + "s?.*"; // case-insensitive, optional 's'

        // --- POSTS: userName, title, tags ---
        Query postQuery = new Query();
        postQuery.addCriteria(new Criteria().orOperator(
                Criteria.where("userName").regex(regex),
                Criteria.where("title").regex(regex),
                Criteria.where("tags").regex(regex)
        ));
        List<Post> posts = mongoTemplate.find(postQuery, Post.class);
        if (!posts.isEmpty()) results.put("posts", posts);

        // --- BLOGS: userName, title, content, tags ---
        Query blogQuery = new Query();
        blogQuery.addCriteria(new Criteria().orOperator(
                Criteria.where("userName").regex(regex),
                Criteria.where("title").regex(regex),
                Criteria.where("content").regex(regex),
                Criteria.where("tags").regex(regex)
        ));
        List<Blog> blogs = mongoTemplate.find(blogQuery, Blog.class);
        if (!blogs.isEmpty()) results.put("blogs", blogs);

        // --- GROUPS: name, description, tags ---
        Query groupQuery = new Query();
        groupQuery.addCriteria(new Criteria().orOperator(
                Criteria.where("name").regex(regex),
                Criteria.where("description").regex(regex),
                Criteria.where("tags").regex(regex)
        ));
        List<Group> groups = mongoTemplate.find(groupQuery, Group.class);
        if (!groups.isEmpty()) results.put("groups", groups);

        // --- USERS: gamerName, role ---
        Query userQuery = new Query();
        userQuery.addCriteria(new Criteria().orOperator(
                Criteria.where("gamerName").regex(regex),
                Criteria.where("role").regex(regex)
        ));
        List<UserProfile> users = mongoTemplate.find(userQuery, UserProfile.class);
        if (!users.isEmpty()) results.put("users", users);

        return results;
    }
}
