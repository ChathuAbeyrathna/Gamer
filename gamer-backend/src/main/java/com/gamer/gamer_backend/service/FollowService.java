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

    private FollowInfo getOrCreate(String email) {
        return repo.findByEmail(email)
                .orElseGet(() -> repo.save(new FollowInfo(null, email, new HashSet<>(), new HashSet<>())));
    }

    public String toggleFollow(String fromEmail, String toEmail) {
        if (fromEmail.equals(toEmail))
            return "error";

        FollowInfo from = getOrCreate(fromEmail);
        FollowInfo to = getOrCreate(toEmail);

        if (from.getFollowing().remove(toEmail)) {
            to.getFollowers().remove(fromEmail);
            repo.save(from);
            repo.save(to);
            return "UNFOLLOWED";
        } else {
            from.getFollowing().add(toEmail);
            to.getFollowers().add(fromEmail);
            repo.save(from);
            repo.save(to);
            return "FOLLOWED";
        }
    }

    public List<UserProfile> getFollowing(String email) {
        Set<String> following = getOrCreate(email).getFollowing();
        return profileRepo.findByEmailIn(following);
    }

    public List<UserProfile> getFollowers(String email) {
        Set<String> followers = getOrCreate(email).getFollowers();
        return profileRepo.findByEmailIn(followers);
    }

    public Map<String, Boolean> getStatus(String myEmail, String targetEmail) {
        FollowInfo me = getOrCreate(myEmail);
        return Map.of(
                "isFollowing", me.getFollowing().contains(targetEmail));
    }

    public FollowInfo getFollowInfo(String email) {
        return repo.findByEmail(email)
                .orElse(new FollowInfo(null, email, new HashSet<>(), new HashSet<>()));
    }
}
