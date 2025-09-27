package com.gamer.gamer_backend.config;

import com.gamer.gamer_backend.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Filter that checks for JWT in the Authorization header and sets
 * authentication in the security context.
 */
@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil; // Utility class for JWT operations

    /**
     * Filters each request to check for a valid JWT token.
     */
    @Override
    protected void doFilterInternal(HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        // Get the Authorization header from the request
        String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);

        // Check if the header contains a Bearer token
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            // Extract the token from the header
            String token = authHeader.substring(7);

            // Validate the token
            if (jwtUtil.validateToken(token)) {
                // Extract the email from the token
                String email = jwtUtil.extractEmail(token);

                // Create an authentication token and set it in the security context
                UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(email, null, null);
                SecurityContextHolder.getContext().setAuthentication(auth);
            }
        }

        // Continue with the filter chain
        filterChain.doFilter(request, response);
    }
}
