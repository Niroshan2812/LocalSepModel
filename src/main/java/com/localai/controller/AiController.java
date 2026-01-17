package com.localai.controller;

import org.springframework.ai.chat.ChatClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/chat")
public class AiController {

    private final ChatClient chatClient;

    public AiController(ChatClient chatClient) {
        this.chatClient = chatClient;
    }

    @PostMapping
    public Map<String, String> chat(@RequestBody Map<String, String> request) {
        String userMessage = request.get("message");
        String response = chatClient.call(userMessage);
        return Map.of("response", response);
    }

    @PostMapping("/classify")
    public Map<String, String> classify(@RequestBody Map<String, String> request) {
        String text = request.get("text");
        // Simple zero-shot classification prompt
        String prompt = "Classify the following text into a simple category (e.g. Food, Transport, Health, Work, Other). Respond with ONLY the category name.\nText: "
                + text;
        String category = chatClient.call(prompt);
        return Map.of("category", category.trim());
    }
}
