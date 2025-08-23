package com.gamer.gamer_backend.controller;

import com.gamer.gamer_backend.models.Chat;
import com.gamer.gamer_backend.models.UserProfile;
import com.gamer.gamer_backend.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class ChatController {

    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/send") // WebSocket endpoint
    public void sendMessage(Chat chat) {
        chatService.saveMessage(chat);
        // send to receiver
        messagingTemplate.convertAndSendToUser(chat.getReceiverEmail(), "/queue/messages", chat);
    }

    // HTTP endpoint to fetch chat history
    @GetMapping("/history/{user1}/{user2}")
    public List<Chat> getChatHistory(@PathVariable String user1, @PathVariable String user2) {
        return chatService.getChatHistory(user1, user2);
    }

    // New endpoint
    @GetMapping("/list")
    public List<UserProfile> getChatList(@RequestParam String currentUserEmail) {
        return chatService.getChatUsersWithProfile(currentUserEmail);
    }

}
