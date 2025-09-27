package com.gamer.gamer_backend.service;

import com.gamer.gamer_backend.models.FollowInfo;
import com.gamer.gamer_backend.models.UserProfile;
import com.gamer.gamer_backend.repository.FollowInfoRepository;
import com.gamer.gamer_backend.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class FollowService {

    private final FollowInfoRepository repo;
    private final UserProfileRepository profileRepo;

    // Retrieves the FollowInfo for the given email, or creates a new one if not found
    private FollowInfo getOrCreate(String email) {
        return repo.findByEmail(email)
                .orElseGet(() -> repo.save(new FollowInfo(null, email, new HashSet<>(), new HashSet<>())));
    }

    // Toggles the follow status between two users. Returns "FOLLOWED", "UNFOLLOWED", or "error" if emails are the same
    public String toggleFollow(String fromEmail, String toEmail) {
        if (fromEmail.equals(toEmail))
            return "error";

        FollowInfo from = getOrCreate(fromEmail);
        FollowInfo to = getOrCreate(toEmail);

        // If already following, unfollow
        if (from.getFollowing().remove(toEmail)) {
            to.getFollowers().remove(fromEmail);
            repo.save(from);
            repo.save(to);
            return "UNFOLLOWED";
        } else {
            // Otherwise, follow
            from.getFollowing().add(toEmail);
            to.getFollowers().add(fromEmail);
            repo.save(from);
            repo.save(to);
            return "FOLLOWED";
        }
    }

    // Returns a list of UserProfiles that the given user is following
    public List<UserProfile> getFollowing(String email) {
        Set<String> following = getOrCreate(email).getFollowing();
        return profileRepo.findByEmailIn(following);
    }

    // Returns a list of UserProfiles that follow the given user
    public List<UserProfile> getFollowers(String email) {
        Set<String> followers = getOrCreate(email).getFollowers();
        return profileRepo.findByEmailIn(followers);
    }

    // Returns a map indicating if myEmail is following targetEmail
    public Map<String, Boolean> getStatus(String myEmail, String targetEmail) {
        FollowInfo me = getOrCreate(myEmail);
        return Map.of(
                "isFollowing", me.getFollowing().contains(targetEmail));
    }

    // Retrieves the FollowInfo for the given email, or returns a new empty FollowInfo if not found
    public FollowInfo getFollowInfo(String email) {
        return repo.findByEmail(email)
                .orElse(new FollowInfo(null, email, new HashSet<>(), new HashSet<>()));
    }
}
