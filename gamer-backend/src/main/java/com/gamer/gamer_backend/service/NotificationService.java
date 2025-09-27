package com.gamer.gamer_backend.service;

import com.gamer.gamer_backend.models.Notification;
import com.gamer.gamer_backend.repository.NotificationRepository;
import com.gamer.gamer_backend.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Service class for managing user notifications.
 * Handles creation, retrieval, sending via WebSocket, and marking as read.
 */
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserProfileRepository userProfileRepository;
    private final SimpMessagingTemplate messagingTemplate; // For WebSocket notifications

    /**
     * Send a notification from one user to another.
     *
     * @param senderId   The email/ID of the sender.
     * @param receiverId The email/ID of the receiver.
     * @param type       Type of notification (e.g., "comment", "follow", "like").
     * @param postId     Optional related post/blog ID.
     * @param message    The notification message text.
     */
    public void sendNotification(String senderId, String receiverId, String type, String postId, String message) {
        // Prevent self-notification (user cannot notify themselves)
        if (senderId.equals(receiverId))
            return;

        // Build notification object
        Notification notification = Notification.builder()
                .senderId(senderId)
                .receiverId(receiverId)
                .type(type)
                .postId(postId)
                .message(message)
                .read(false) // new notifications are unread
                .createdAt(LocalDateTime.now())
                .build();

        // Save notification to database
        notificationRepository.save(notification);

        // Enrich notification with sender profile info (name + image)
        userProfileRepository.findByEmail(notification.getSenderId()).ifPresent(profile -> {
            notification.setSenderName(profile.getGamerName());
            notification.setSenderImageUrl(profile.getImageUrl());
        });

        // Send real-time notification via WebSocket to the receiver
        messagingTemplate.convertAndSend(
                "/topic/notifications/" + receiverId,
                notification
        );
    }

    /**
     * Get all notifications for a user, sorted by creation time (newest first).
     *
     * @param userId The email/ID of the user.
     * @return List of notifications with sender profile details.
     */
    public List<Notification> getNotifications(String userId) {
        // Fetch notifications for the user, ordered by most recent
        List<Notification> notifications = notificationRepository.findByReceiverIdOrderByCreatedAtDesc(userId);

        // Attach sender profile details to each notification
        for (Notification notification : notifications) {
            userProfileRepository.findByEmail(notification.getSenderId()).ifPresent(profile -> {
                notification.setSenderName(profile.getGamerName());
                notification.setSenderImageUrl(profile.getImageUrl());
            });
        }

        return notifications;
    }

    /**
     * Mark a single notification as read.
     *
     * @param notificationId The notification's ID.
     * @param currentUserId  The ID of the user performing the action (must match receiver).
     * @return Updated notification object.
     */
    public Notification markNotificationAsRead(String notificationId, String currentUserId) {
        // Find notification by ID or throw error if not found
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        // Ensure only the intended receiver can mark it as read
        if (!notification.getReceiverId().equals(currentUserId)) {
            throw new RuntimeException("You cannot update someone else's notification");
        }

        // Update status and save
        notification.setRead(true);
        return notificationRepository.save(notification);
    }
}
