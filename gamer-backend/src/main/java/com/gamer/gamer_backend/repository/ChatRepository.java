package com.gamer.gamer_backend.repository;

import com.gamer.gamer_backend.models.Chat;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ChatRepository extends MongoRepository<Chat, String> {

    // Get chat messages between two users, ordered by timestamp ascending
    List<Chat> findBySenderEmailAndReceiverEmailOrReceiverEmailAndSenderEmailOrderByTimestampAsc(
            String senderEmail, String receiverEmail, String senderEmail2, String receiverEmail2);

    // Get all chats where a user is either sender or receiver
    List<Chat> findBySenderEmailOrReceiverEmail(String sender, String receiver);
}
