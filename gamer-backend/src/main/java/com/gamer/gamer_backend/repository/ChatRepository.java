package com.gamer.gamer_backend.repository;

import com.gamer.gamer_backend.models.Chat;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ChatRepository extends MongoRepository<Chat, String> {
    List<Chat> findBySenderEmailAndReceiverEmailOrReceiverEmailAndSenderEmailOrderByTimestampAsc(
        String senderEmail, String receiverEmail, String senderEmail2, String receiverEmail2
    );

    List<Chat> findBySenderEmailOrReceiverEmail(String sender, String receiver);
}
