package com.gamer.gamer_backend.service;

import com.gamer.gamer_backend.models.Blog;
import com.gamer.gamer_backend.models.Boost;
import com.gamer.gamer_backend.models.Post;
import com.gamer.gamer_backend.models.UserProfile;
import com.gamer.gamer_backend.repository.BoostRepository;
import com.gamer.gamer_backend.repository.PostRepository;
import com.gamer.gamer_backend.repository.BlogRepository;
import com.gamer.gamer_backend.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BoostService {

    private final BoostRepository boostRepository;
    private final UserProfileRepository userProfileRepository;
    private final PostRepository postRepository; 
    private final BlogRepository blogRepository;

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

    public String getPostOwnerId(String id) {
        String owner = postRepository.findById(id).map(Post::getEmail).orElse(null);
        if (owner != null) return owner;
        return blogRepository.findById(id).map(Blog::getEmail).orElse(null);
    }
}

