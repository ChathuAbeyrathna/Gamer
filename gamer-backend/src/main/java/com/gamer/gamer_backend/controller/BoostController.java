package com.gamer.gamer_backend.controller;

import com.gamer.gamer_backend.models.Boost;
import com.gamer.gamer_backend.service.BoostService;
import com.gamer.gamer_backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/boosts")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class BoostController {

    private final BoostService boostService;
    private final NotificationService notificationService;

    @PostMapping("/toggle/{postId}")
    public Map<String, Boolean> toggleBoost(@PathVariable String postId, Principal principal) {
        boolean boosted = boostService.toggleBoost(principal.getName(), postId);

        if (boosted) {
            String receiverId = boostService.getPostOwnerId(postId); // ✅ Make sure this method exists
            notificationService.sendNotification(
                    principal.getName(), receiverId, "BOOST", postId, "boosted to your post");
        }

        Map<String, Boolean> response = new HashMap<>();
        response.put("boosted", boosted);
        return response;
    }

    @GetMapping("/{postId}")
    public List<Boost> getBoosts(@PathVariable String postId) {
        return boostService.getBoosts(postId);
    }
}
