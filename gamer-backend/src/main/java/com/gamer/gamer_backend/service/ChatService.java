package com.gamer.gamer_backend.service;

import com.gamer.gamer_backend.models.Chat;
import com.gamer.gamer_backend.models.UserProfile;
import com.gamer.gamer_backend.repository.ChatRepository;
import com.gamer.gamer_backend.repository.UserProfileRepository;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * ChatService
 * - Handles all chat-related business logic
 * - Provides saving messages, fetching chat history, and listing chat users with metadata
 */
@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatRepository chatRepository;
    private final UserProfileRepository userProfileRepository;

    /**
     * Save a new chat message
     * - Marks the message as unread by default
     */
    public Chat saveMessage(Chat chat) {
        chat.setRead(false);
        return chatRepository.save(chat);
    }

    /**
     * Get chat history between two users
     * - Marks messages received by the current user as read
     */
    public List<Chat> getChatHistory(String user1, String user2) {
        List<Chat> history = chatRepository
                .findBySenderEmailAndReceiverEmailOrReceiverEmailAndSenderEmailOrderByTimestampAsc(
                        user1, user2, user1, user2);

        // Mark unread messages as read for the current user
        history.stream()
                .filter(c -> c.getReceiverEmail().equals(user1) && !c.isRead())
                .forEach(c -> {
                    c.setRead(true);
                    chatRepository.save(c);
                });

        return history;
    }

    /**
     * Get a list of users the current user has chatted with
     * - Includes last message info and unread message status
     */
    public List<UserProfileWithMeta> getChatUsersWithProfile(String currentUserEmail) {
        List<Chat> chats = chatRepository.findBySenderEmailOrReceiverEmail(currentUserEmail, currentUserEmail);

        Map<String, Chat> lastMessageMap = new HashMap<>();
        Map<String, Boolean> unreadMap = new HashMap<>();

        // Determine last message per user and unread status
        for (Chat chat : chats) {
            String otherUserEmail = chat.getSenderEmail().equals(currentUserEmail) 
                    ? chat.getReceiverEmail() 
                    : chat.getSenderEmail();

            // Store the most recent message for each chat partner
            if (!lastMessageMap.containsKey(otherUserEmail)
                    || chat.getTimestamp().isAfter(lastMessageMap.get(otherUserEmail).getTimestamp())) {
                lastMessageMap.put(otherUserEmail, chat);
            }

            // Track unread messages
            if (!chat.isRead() && chat.getReceiverEmail().equals(currentUserEmail)) {
                unreadMap.put(otherUserEmail, true);
            } else {
                unreadMap.putIfAbsent(otherUserEmail, false);
            }
        }

        Set<String> emails = lastMessageMap.keySet();
        List<UserProfile> profiles = userProfileRepository.findByEmailIn(emails);

        // Combine user profile info with last message and unread status
        List<UserProfileWithMeta> result = new ArrayList<>();
        for (UserProfile profile : profiles) {
            Chat lastMsg = lastMessageMap.get(profile.getEmail());
            boolean hasUnread = unreadMap.getOrDefault(profile.getEmail(), false);
            result.add(new UserProfileWithMeta(profile, lastMsg, hasUnread));
        }

        // Sort by last message timestamp descending
        result.sort((a, b) -> b.getLastMessage().getTimestamp().compareTo(a.getLastMessage().getTimestamp()));

        return result;
    }

    /**
     * DTO to hold user profile with last message and unread status
     */
    @Data
    @AllArgsConstructor
    public static class UserProfileWithMeta {
        private UserProfile profile;
        private Chat lastMessage;
        private boolean hasUnread;
    }
}
