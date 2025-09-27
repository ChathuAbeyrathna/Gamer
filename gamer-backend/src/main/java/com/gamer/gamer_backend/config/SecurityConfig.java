package com.gamer.gamer_backend.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration // Marks this class as a configuration class for Spring
public class SecurityConfig {

    @Autowired // Injects the JwtAuthFilter bean
    private JwtAuthFilter jwtAuthFilter;

    @Bean // Declares a bean for the security filter chain
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable()) // Disable CSRF protection (useful for APIs)
                .authorizeHttpRequests(auth -> auth
                        // Allow unauthenticated access to authentication endpoints
                        .requestMatchers("/api/auth/**").permitAll()
                        // Allow unauthenticated access to websocket endpoints
                        .requestMatchers("/ws/**").permitAll()

                        // Allow unauthenticated GET requests to posts, blogs, profiles, comments,
                        // boosts
                        .requestMatchers(HttpMethod.GET, "/api/posts/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/blogs/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/profile/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/comments/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/boosts/**").permitAll()
                        // Allow unauthenticated OPTIONS requests (for CORS preflight)
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // Require authentication for all other requests (POST, PUT, DELETE, etc.)
                        .anyRequest().authenticated())
                // Add JWT authentication filter before the default username/password filter
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build(); // Build and return the security filter chain
    }
}
