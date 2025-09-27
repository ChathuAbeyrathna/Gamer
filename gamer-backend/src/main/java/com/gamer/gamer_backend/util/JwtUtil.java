package com.gamer.gamer_backend.util;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

import javax.crypto.SecretKey;

/**
 * Utility class for handling JWT (JSON Web Token) operations.
 */
@Component
public class JwtUtil {

    /**
     * Secret key for signing JWTs.
     * Loaded from application.properties (or environment variable).
     */
    @Value("${jwt.secret}")
    private String SECRET;

    /**
     * Token expiration time in ms.
     * Default: 24 hours.
     */
    @Value("${jwt.expiration}")
    private long EXPIRATION_TIME;

    /**
     * Builds a secure cryptographic signing key.
     */
    private Key getKey() {
        return Keys.hmacShaKeyFor(SECRET.getBytes());
    }

    /**
     * Generate JWT for given email.
     */
    public String generateToken(String email) {
        return Jwts.builder()
                .subject(email)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(getKey())
                .compact();
    }

    /**
     * Extract email (subject) from token.
     */
    public String extractEmail(String token) {
        return Jwts.parser()
                .verifyWith((SecretKey) getKey())
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }

    /**
     * Validate token signature & expiration.
     */
    public boolean validateToken(String token) {
        try {
            extractEmail(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
