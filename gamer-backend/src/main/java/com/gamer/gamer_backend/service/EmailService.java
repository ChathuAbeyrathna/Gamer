package com.gamer.gamer_backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    // Injects the JavaMailSender bean for sending emails
    @Autowired
    private JavaMailSender mailSender;

    /**
     * Sends a password reset link to the specified email address.
     *
     * @param toEmail  the recipient's email address
     * @param resetUrl the URL for resetting the password
     */
    public void sendResetLink(String toEmail, String resetUrl) {
        // Create a simple email message
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("Reset your Gamer password");
        message.setText("Click to reset your password:\n" + resetUrl +
                "\n\nIf you didn’t request this, ignore it.");
        // Send the email
        mailSender.send(message);
    }
}
