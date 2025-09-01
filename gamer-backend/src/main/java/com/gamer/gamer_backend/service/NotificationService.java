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
    private final SimpMessagingTemplate messagingTemplate;

    public void sendNotification(String senderId, String receiverId, String type, String postId, String message) {
        if (senderId.equals(receiverId))
            return;

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

        userProfileRepository.findByEmail(notification.getSenderId()).ifPresent(profile -> {
            notification.setSenderName(profile.getGamerName());
            notification.setSenderImageUrl(profile.getImageUrl());
        });

        messagingTemplate.convertAndSend(
                "/topic/notifications/" + receiverId,
                notification);
    }

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
