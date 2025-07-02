package com.gamer.gamer_backend.service;

import com.gamer.gamer_backend.models.Boost;
import com.gamer.gamer_backend.models.UserProfile;
import com.gamer.gamer_backend.repository.BoostRepository;
import com.gamer.gamer_backend.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BoostService {

    private final BoostRepository boostRepository;
    private final UserProfileRepository userProfileRepository;

    public boolean toggleBoost(String email, String postId) {
        var existing = boostRepository.findByUserEmailAndPostId(email, postId);
        if (existing.isPresent()) {
            boostRepository.deleteByUserEmailAndPostId(email, postId);
            return false;
        } else {
            UserProfile profile = userProfileRepository.findByEmail(email).orElse(null);
            Boost boost = Boost.builder()
                    .userEmail(email)
                    .postId(postId)
                    .userName(profile != null ? profile.getGamerName() : "Unknown")
                    .userImage(profile != null ? profile.getImageUrl() : "")
                    .build();
            boostRepository.save(boost);
            return true; 
        }
    }

    public List<Boost> getBoosts(String postId) {
        return boostRepository.findByPostId(postId);
    }
}
