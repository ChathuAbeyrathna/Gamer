package com.gamer.gamer_backend.controller;

import com.gamer.gamer_backend.models.Notification;
import com.gamer.gamer_backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public List<Notification> getMyNotifications(Principal principal) {
        return notificationService.getNotifications(principal.getName());
    }

    @PatchMapping("/{id}/read")
    public Notification markAsRead(@PathVariable String id, Principal principal) {
        return notificationService.markNotificationAsRead(id, principal.getName());
    }
}
