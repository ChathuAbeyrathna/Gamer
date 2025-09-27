package com.gamer.gamer_backend.controller;

import com.gamer.gamer_backend.models.UserProfile;
import com.gamer.gamer_backend.service.FollowService;
import com.gamer.gamer_backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

/**
 * Controller for handling follow-related API endpoints.
 */
@RestController
@RequestMapping("/api/follow")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class FollowController {

    // Service for follow operations
    private final FollowService service;
    // Service for sending notifications
    private final NotificationService notificationService;

    /**
     * Toggles follow/unfollow for the given email.
     * Sends a notification if followed.
     *
     * @param email     The email of the user to follow/unfollow
     * @param principal The authenticated user
     * @return Status of the follow action
     */
    @PostMapping("/toggle-follow/{email}")
    public Map<String, String> toggleFollow(@PathVariable String email, Principal principal) {
        String senderId = principal.getName();
        String status = service.toggleFollow(senderId, email);

        // Send notification only if followed and not self-follow
        if ("FOLLOWED".equals(status) && !senderId.equals(email)) {
            notificationService.sendNotification(
                    senderId,
                    email,
                    "FOLLOW",
                    null,
                    "started following you");
        }

        return Map.of("status", status);
    }

    /**
     * Gets the follow status between the authenticated user and the given email.
     *
     * @param email     The email to check status with
     * @param principal The authenticated user
     * @return Map indicating follow status
     */
    @GetMapping("/status/{email}")
    public Map<String, Boolean> getStatus(@PathVariable String email, Principal principal) {
        return service.getStatus(principal.getName(), email);
    }

    /**
     * Gets the list of followers for the given email.
     *
     * @param email The email whose followers are requested
     * @return List of user profiles who follow the user
     */
    @GetMapping("/followers/{email}")
    public List<UserProfile> getFollowers(@PathVariable String email) {
        return service.getFollowers(email);
    }

    /**
     * Gets the list of users followed by the given email.
     *
     * @param email The email whose following list is requested
     * @return List of user profiles the user is following
     */
    @GetMapping("/following/{email}")
    public List<UserProfile> getFollowing(@PathVariable String email) {
        return service.getFollowing(email);
    }
}
