package com.gamer.gamer_backend.controller;

import com.gamer.gamer_backend.models.Notification;
import com.gamer.gamer_backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

/**
 * REST controller for handling notification-related endpoints.
 */
@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class NotificationController {

    // Service for notification operations
    private final NotificationService notificationService;

    /**
     * Get all notifications for the authenticated user.
     *
     * @param principal the security principal representing the current user
     * @return list of notifications
     */
    @GetMapping
    public List<Notification> getMyNotifications(Principal principal) {
        return notificationService.getNotifications(principal.getName());
    }

    /**
     * Mark a specific notification as read for the authenticated user.
     *
     * @param id        the notification ID
     * @param principal the security principal representing the current user
     * @return the updated notification
     */
    @PatchMapping("/{id}/read")
    public Notification markAsRead(@PathVariable String id, Principal principal) {
        return notificationService.markNotificationAsRead(id, principal.getName());
    }
}
