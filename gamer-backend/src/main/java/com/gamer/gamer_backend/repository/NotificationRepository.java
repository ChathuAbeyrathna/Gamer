package com.gamer.gamer_backend.repository;

import com.gamer.gamer_backend.models.Notification;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface NotificationRepository extends MongoRepository<Notification, String> {

    // Get all notifications for a specific receiver, ordered by newest first
    List<Notification> findByReceiverIdOrderByCreatedAtDesc(String receiverId);
}
