package com.gamer.gamer_backend.repository;

import com.gamer.gamer_backend.models.Notification;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface NotificationRepository extends MongoRepository<Notification, String> {
    List<Notification> findByReceiverIdOrderByCreatedAtDesc(String receiverId);
}
