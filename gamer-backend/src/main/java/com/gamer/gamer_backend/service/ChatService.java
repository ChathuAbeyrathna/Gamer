package com.gamer.gamer_backend.service;

import com.gamer.gamer_backend.models.Chat;
import com.gamer.gamer_backend.models.UserProfile;
import com.gamer.gamer_backend.repository.ChatRepository;
import com.gamer.gamer_backend.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatRepository chatRepository;
    private final UserProfileRepository userProfileRepository;

    public Chat saveMessage(Chat chat) {
        return chatRepository.save(chat);
    }

    public List<Chat> getChatHistory(String user1, String user2) {
        return chatRepository.findBySenderEmailAndReceiverEmailOrReceiverEmailAndSenderEmailOrderByTimestampAsc(
                user1, user2, user1, user2);
    }

    // Fetch list of users the current user has chatted with
    public List<UserProfile> getChatUsersWithProfile(String currentUserEmail) {
        // fetch only chats where current user is sender or receiver
        List<Chat> chats = chatRepository.findBySenderEmailOrReceiverEmail(currentUserEmail, currentUserEmail);

        Set<String> otherEmails = new HashSet<>();
        for (Chat chat : chats) {
            if (!chat.getSenderEmail().equals(currentUserEmail)) {
                otherEmails.add(chat.getSenderEmail());
            }
            if (!chat.getReceiverEmail().equals(currentUserEmail)) {
                otherEmails.add(chat.getReceiverEmail());
            }
        }

        // fetch profiles of those users
        return userProfileRepository.findByEmailIn(otherEmails);
    }

}
