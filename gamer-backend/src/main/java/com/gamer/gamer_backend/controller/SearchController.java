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

/**
 * Controller for handling search requests across multiple collections.
 */
@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class SearchController {

        // Injects MongoTemplate for database operations
        private final MongoTemplate mongoTemplate;

        /**
         * Searches posts, blogs, groups, and user profiles by query string.
         * 
         * @param query The search term provided by the user.
         * @return A map containing matched results from each collection.
         */
        @GetMapping
        public Map<String, Object> search(@RequestParam String query) {
                Map<String, Object> results = new HashMap<>();

                // Return empty results if query is null or blank
                if (query == null || query.trim().isEmpty()) {
                        return results;
                }

                // Normalize and build case-insensitive regex for search
                String normalizedQuery = query.trim();
                String regex = "(?i).*" + normalizedQuery + "s?.*";

                // Search Posts by userName, title, or tags
                Query postQuery = new Query();
                postQuery.addCriteria(new Criteria().orOperator(
                                Criteria.where("userName").regex(regex),
                                Criteria.where("title").regex(regex),
                                Criteria.where("tags").regex(regex)));
                List<Post> posts = mongoTemplate.find(postQuery, Post.class);
                if (!posts.isEmpty())
                        results.put("posts", posts);

                // Search Blogs by userName, title, content, or tags
                Query blogQuery = new Query();
                blogQuery.addCriteria(new Criteria().orOperator(
                                Criteria.where("userName").regex(regex),
                                Criteria.where("title").regex(regex),
                                Criteria.where("content").regex(regex),
                                Criteria.where("tags").regex(regex)));
                List<Blog> blogs = mongoTemplate.find(blogQuery, Blog.class);
                if (!blogs.isEmpty())
                        results.put("blogs", blogs);

                // Search Groups by name, description, or tags
                Query groupQuery = new Query();
                groupQuery.addCriteria(new Criteria().orOperator(
                                Criteria.where("name").regex(regex),
                                Criteria.where("description").regex(regex),
                                Criteria.where("tags").regex(regex)));
                List<Group> groups = mongoTemplate.find(groupQuery, Group.class);
                if (!groups.isEmpty())
                        results.put("groups", groups);

                // Search UserProfiles by gamerName or role
                Query userQuery = new Query();
                userQuery.addCriteria(new Criteria().orOperator(
                                Criteria.where("gamerName").regex(regex),
                                Criteria.where("role").regex(regex)));
                List<UserProfile> users = mongoTemplate.find(userQuery, UserProfile.class);
                if (!users.isEmpty())
                        results.put("users", users);

                // Return the aggregated search results
                return results;
        }
}
