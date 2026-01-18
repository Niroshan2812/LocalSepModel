package com.localai.controller;

import com.localai.service.LegalService;
import com.localai.service.ModelManagerService;
import com.localai.service.DocumentService;
import org.springframework.ai.chat.ChatClient;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.ollama.api.OllamaOptions;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile; // For consistency if needed

import java.util.Map;

@RestController
@RequestMapping("/api/legal")
public class LegalController {

    private final LegalService legalService;
    private final ChatClient chatClient;
    private final ModelManagerService modelManager;
    // We might need DocumentService if we want to fetch text by ID later,
    // but for now we'll accept text from frontend.

    public LegalController(LegalService legalService, ChatClient chatClient, ModelManagerService modelManager) {
        this.legalService = legalService;
        this.chatClient = chatClient;
        this.modelManager = modelManager;
    }

    @PostMapping("/sanitize")
    public Map<String, Object> sanitize(@RequestBody Map<String, String> request) {
        String text = request.get("text");
        return legalService.sanitizeDocument(text);
    }

    @PostMapping("/risks")
    public Map<String, String> analyzeRisks(@RequestBody Map<String, String> request) {
        String text = request.get("text");
        String promptText = legalService.prepareRiskAnalysisPrompt(text);

        // Use Pro model if available for better reasoning, else Lite
        String model = modelManager.getCurrentModel();

        Prompt prompt = new Prompt(promptText, OllamaOptions.create().withModel(model));
        String response = chatClient.call(prompt).getResult().getOutput().getContent();

        return Map.of("risks", response);
    }

    @PostMapping("/fill")
    public Map<String, String> autoFill(@RequestBody Map<String, String> request) {
        String profile = request.get("profile");
        String formText = request.get("formText");

        String promptText = legalService.prepareFormFillPrompt(profile, formText);
        String model = modelManager.getCurrentModel();

        Prompt prompt = new Prompt(promptText, OllamaOptions.create().withModel(model));
        String response = chatClient.call(prompt).getResult().getOutput().getContent();

        return Map.of("suggestions", response);
    }
}
