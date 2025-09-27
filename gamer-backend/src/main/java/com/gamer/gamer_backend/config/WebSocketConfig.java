package com.gamer.gamer_backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

// Marks this class as a configuration class for Spring
@Configuration
// Enables WebSocket message handling, backed by a message broker
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    // Registers STOMP endpoints for WebSocket connections
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws") // Endpoint for WebSocket handshake
                .setAllowedOriginPatterns("*") // Allow connections from any origin
                .withSockJS(); // Enable SockJS fallback for browsers that don't support WebSocket
    }

    // Configures the message broker for routing messages
    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic", "/queue"); // Enables a simple in-memory broker for these destinations
        config.setApplicationDestinationPrefixes("/app"); // Prefix for messages bound for @MessageMapping methods
        config.setUserDestinationPrefix("/user"); // Prefix for user-specific messages
    }
}
