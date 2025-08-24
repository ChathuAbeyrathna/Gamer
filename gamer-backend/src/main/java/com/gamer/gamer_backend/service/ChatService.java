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

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatRepository chatRepository;
    private final UserProfileRepository userProfileRepository;

    public Chat saveMessage(Chat chat) {
        chat.setRead(false); // new messages are unread
        return chatRepository.save(chat);
    }

    public List<Chat> getChatHistory(String user1, String user2) {
        List<Chat> history = chatRepository.findBySenderEmailAndReceiverEmailOrReceiverEmailAndSenderEmailOrderByTimestampAsc(
                user1, user2, user1, user2
        );

        // Mark all messages received by user1 as read
        history.stream()
                .filter(c -> c.getReceiverEmail().equals(user1) && !c.isRead())
                .forEach(c -> { c.setRead(true); chatRepository.save(c); });

        return history;
    }

    public List<UserProfileWithMeta> getChatUsersWithProfile(String currentUserEmail) {
        List<Chat> chats = chatRepository.findBySenderEmailOrReceiverEmail(currentUserEmail, currentUserEmail);

        Map<String, Chat> lastMessageMap = new HashMap<>();
        Map<String, Boolean> unreadMap = new HashMap<>();

        for (Chat chat : chats) {
            String other = chat.getSenderEmail().equals(currentUserEmail) ? chat.getReceiverEmail() : chat.getSenderEmail();

            if (!lastMessageMap.containsKey(other) || chat.getTimestamp().isAfter(lastMessageMap.get(other).getTimestamp())) {
                lastMessageMap.put(other, chat);
            }

            if (!chat.isRead() && chat.getReceiverEmail().equals(currentUserEmail)) {
                unreadMap.put(other, true);
            } else {
                unreadMap.putIfAbsent(other, false);
            }
        }

        Set<String> emails = lastMessageMap.keySet();
        List<UserProfile> profiles = userProfileRepository.findByEmailIn(emails);

        List<UserProfileWithMeta> result = new ArrayList<>();
        for (UserProfile profile : profiles) {
            Chat lastMsg = lastMessageMap.get(profile.getEmail());
            boolean hasUnread = unreadMap.getOrDefault(profile.getEmail(), false);
            result.add(new UserProfileWithMeta(profile, lastMsg, hasUnread));
        }

        result.sort((a, b) -> b.getLastMessage().getTimestamp().compareTo(a.getLastMessage().getTimestamp()));
        return result;
    }

    @Data
    @AllArgsConstructor
    public static class UserProfileWithMeta {
        private UserProfile profile;
        private Chat lastMessage;
        private boolean hasUnread;
    }
}
