package com.gamer.gamer_backend.controller;

import com.gamer.gamer_backend.models.Boost;
import com.gamer.gamer_backend.service.BoostService;
import com.gamer.gamer_backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * REST controller for handling boost-related operations.
 */
@RestController
@RequestMapping("/api/boosts")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class BoostController {

    // Service for boost operations
    private final BoostService boostService;
    // Service for sending notifications
    private final NotificationService notificationService;

    /**
     * Toggles boost status for a post by the current user.
     * If boosted, sends a notification to the post owner.
     *
     * @param postId    ID of the post to boost/unboost
     * @param principal Authenticated user principal
     * @return Map indicating whether the post is boosted
     */
    @PostMapping("/toggle/{postId}")
    public Map<String, Boolean> toggleBoost(@PathVariable String postId, Principal principal) {
        // Toggle boost for the post
        boolean boosted = boostService.toggleBoost(principal.getName(), postId);

        // If boosted, send notification to post owner
        if (boosted) {
            String receiverId = boostService.getPostOwnerId(postId); // Get post owner ID
            notificationService.sendNotification(
                    principal.getName(), receiverId, "BOOST", postId, "boosted to your post");
        }

        // Prepare response
        Map<String, Boolean> response = new HashMap<>();
        response.put("boosted", boosted);
        return response;
    }

    /**
     * Retrieves all boosts for a given post.
     *
     * @param postId ID of the post
     * @return List of Boost objects
     */
    @GetMapping("/{postId}")
    public List<Boost> getBoosts(@PathVariable String postId) {
        return boostService.getBoosts(postId);
    }
}
