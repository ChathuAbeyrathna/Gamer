package com.gamer.gamer_backend.controller;

import com.gamer.gamer_backend.models.Chat;
import com.gamer.gamer_backend.service.ChatService;
import com.gamer.gamer_backend.service.ChatService.UserProfileWithMeta;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class ChatController {

    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/send")
    public void sendMessage(@Payload Chat chat, Principal principal) {
        if (principal != null) {
            chat.setSenderEmail(principal.getName());
        }

        Chat saved = chatService.saveMessage(chat);

        messagingTemplate.convertAndSendToUser(
                chat.getReceiverEmail(),
                "/queue/messages",
                saved);

        messagingTemplate.convertAndSendToUser(
                saved.getSenderEmail(),
                "/queue/messages",
                saved);
    }

    @PostMapping("/send")
    public Chat sendMessageRest(@RequestBody Chat chat, Principal principal) {
        if (principal != null) {
            chat.setSenderEmail(principal.getName());
        }
        Chat saved = chatService.saveMessage(chat);

        messagingTemplate.convertAndSendToUser(chat.getReceiverEmail(), "/queue/messages", saved);
        messagingTemplate.convertAndSendToUser(saved.getSenderEmail(), "/queue/messages", saved);

        return saved;
    }

    @GetMapping("/history/{user1}/{user2}")
    public List<Chat> getChatHistory(@PathVariable String user1, @PathVariable String user2) {
        return chatService.getChatHistory(user1, user2);
    }

    @GetMapping("/list")
    public List<UserProfileWithMeta> getChatList(@RequestParam String currentUserEmail) {
        return chatService.getChatUsersWithProfile(currentUserEmail);
    }
}
