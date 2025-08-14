package com.gamer.gamer_backend.service;

import com.gamer.gamer_backend.models.Notification;
import com.gamer.gamer_backend.repository.NotificationRepository;
import com.gamer.gamer_backend.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserProfileRepository userProfileRepository;
    private final SimpMessagingTemplate messagingTemplate; // For sending websocket messages

    /**
     * Send a notification to a specific user and push it via WebSocket.
     * We send to: /topic/notifications/{receiverId}
     */
    public void sendNotification(String senderId, String receiverId, String type, String postId, String message) {
        if (senderId.equals(receiverId))
            return; // No self notifications

        Notification notification = Notification.builder()
                .senderId(senderId)
                .receiverId(receiverId)
                .type(type)
                .postId(postId)
                .message(message)
                .read(false)
                .createdAt(LocalDateTime.now())
                .build();

        notificationRepository.save(notification);

        // Enrich with sender details before pushing
        userProfileRepository.findByEmail(notification.getSenderId()).ifPresent(profile -> {
            notification.setSenderName(profile.getGamerName());
            notification.setSenderImageUrl(profile.getImageUrl());
        });

        // Push to /topic/notifications/{receiverId}
        messagingTemplate.convertAndSend(
                "/topic/notifications/" + receiverId,
                notification
        );
    }

    /**
     * Get all notifications for a user.
     */
    public List<Notification> getNotifications(String userId) {
        List<Notification> notifications = notificationRepository.findByReceiverIdOrderByCreatedAtDesc(userId);

        for (Notification notification : notifications) {
            userProfileRepository.findByEmail(notification.getSenderId()).ifPresent(profile -> {
                notification.setSenderName(profile.getGamerName());
                notification.setSenderImageUrl(profile.getImageUrl());
            });
        }

        return notifications;
    }

    /**
     * Mark a notification as read for the current user.
     */
    public Notification markNotificationAsRead(String notificationId, String currentUserId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        if (!notification.getReceiverId().equals(currentUserId)) {
            throw new RuntimeException("You cannot update someone else's notification");
        }

        notification.setRead(true);
        return notificationRepository.save(notification);
    }
}
