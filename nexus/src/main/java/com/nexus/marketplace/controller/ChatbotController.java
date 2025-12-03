package com.nexus.marketplace.controller;

import com.nexus.marketplace.dto.chatbot.ChatMessageRequest;
import com.nexus.marketplace.dto.chatbot.ChatMessageResponse;
import com.nexus.marketplace.service.ChatbotService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chatbot")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class ChatbotController {

    @Autowired
    private ChatbotService chatbotService;

    @PostMapping("/message")
    public ResponseEntity<ChatMessageResponse> sendMessage(@Valid @RequestBody ChatMessageRequest request) {
        ChatMessageResponse response = chatbotService.processMessage(request.getMessage());
        return ResponseEntity.ok(response);
    }
}


