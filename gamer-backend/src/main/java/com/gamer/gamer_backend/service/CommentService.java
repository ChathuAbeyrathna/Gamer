package com.gamer.gamer_backend.service;

import com.gamer.gamer_backend.models.Blog;
import com.gamer.gamer_backend.models.Comment;
import com.gamer.gamer_backend.models.Post;
import com.gamer.gamer_backend.models.UserProfile;
import com.gamer.gamer_backend.repository.CommentRepository;
import com.gamer.gamer_backend.repository.PostRepository;
import com.gamer.gamer_backend.repository.BlogRepository;
import com.gamer.gamer_backend.repository.UserProfileRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

/**
 * Service class for managing comments and replies.
 * Handles CRUD operations for comments across posts and blogs,
 * including recursive fetching and deletion of replies.
 */
@Service
public class CommentService {

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private UserProfileRepository userProfileRepository;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private BlogRepository blogRepository;

    /**
     * Creates a new top-level comment (not a reply).
     * Adds user profile details (gamerName + image) if available.
     *
     * @param comment the comment to save
     * @return the saved Comment object
     */
    public Comment createComment(Comment comment) {
        comment.setCreatedAt(Instant.now());

        // Attach user info if email is provided
        if (comment.getEmail() != null) {
            UserProfile profile = userProfileRepository.findByEmail(comment.getEmail()).orElse(null);
            if (profile != null) {
                comment.setUserName(profile.getGamerName());
                comment.setUserImage(profile.getImageUrl());
            }
        }

        // Ensure it's stored as a top-level comment
        comment.setParentCommentId(null);
        return commentRepository.save(comment);
    }

    /**
     * Creates a reply to an existing comment.
     * Throws exception if parentCommentId is missing.
     *
     * @param reply the reply comment
     * @return the saved reply Comment object
     */
    public Comment createReply(Comment reply) {
        reply.setCreatedAt(Instant.now());

        // Attach user info if email is provided
        if (reply.getEmail() != null) {
            UserProfile profile = userProfileRepository.findByEmail(reply.getEmail()).orElse(null);
            if (profile != null) {
                reply.setUserName(profile.getGamerName());
                reply.setUserImage(profile.getImageUrl());
            }
        }

        // Replies must reference a parent comment
        if (reply.getParentCommentId() == null) {
            throw new IllegalArgumentException("Reply must have a parentCommentId");
        }

        return commentRepository.save(reply);
    }

    /**
     * Retrieves the email of the post/blog owner by content ID.
     *
     * @param id the post or blog ID
     * @return owner's email if found, otherwise null
     */
    public String getPostOwnerId(String id) {
        // Check post ownership first, then fallback to blog ownership
        String owner = postRepository.findById(id).map(Post::getEmail).orElse(null);
        if (owner != null) return owner;
        return blogRepository.findById(id).map(Blog::getEmail).orElse(null);
    }

    /**
     * Gets the author email of a given comment.
     *
     * @param commentId the comment ID
     * @return email of the comment author, or null if not found
     */
    public String getCommentAuthor(String commentId) {
        return commentRepository.findById(commentId)
                .map(Comment::getEmail)
                .orElse(null);
    }

    /**
     * Retrieves all top-level comments for a given post,
     * including their nested replies (recursively).
     *
     * @param postId the post/blog ID
     * @return list of comments with replies attached
     */
    public List<Comment> getCommentsWithReplies(String postId) {
        // Fetch all top-level comments
        List<Comment> topComments = commentRepository.findByPostIdAndParentCommentIdIsNullOrderByCreatedAtAsc(postId);

        // For each top-level comment, recursively fetch replies
        for (Comment c : topComments) {
            c.setReplies(getRepliesRecursive(c.getId()));
        }
        return topComments;
    }

    /**
     * Recursively fetches replies for a given parent comment.
     *
     * @param parentCommentId ID of the parent comment
     * @return list of replies (nested structure)
     */
    private List<Comment> getRepliesRecursive(String parentCommentId) {
        List<Comment> replies = commentRepository.findByParentCommentIdOrderByCreatedAtAsc(parentCommentId);

        // Recursively attach replies to each reply
        for (Comment r : replies) {
            r.setReplies(getRepliesRecursive(r.getId()));
        }
        return replies;
    }

    /**
     * Updates the content of an existing comment.
     *
     * @param id comment ID
     * @param newContent new text content
     * @return updated Comment
     */
    public Comment updateComment(String id, String newContent) {
        Optional<Comment> opt = commentRepository.findById(id);
        if (opt.isEmpty()) {
            throw new RuntimeException("Comment not found");
        }

        Comment comment = opt.get();
        comment.setContent(newContent);
        return commentRepository.save(comment);
    }

    /**
     * Deletes a comment and all its nested replies recursively.
     *
     * @param id comment ID
     */
    public void deleteCommentAndReplies(String id) {
        // Delete all replies first (recursive)
        List<Comment> replies = commentRepository.findByParentCommentIdOrderByCreatedAtAsc(id);
        for (Comment reply : replies) {
            deleteCommentAndReplies(reply.getId());
        }

        // Delete the parent comment itself
        commentRepository.deleteById(id);
    }
}
