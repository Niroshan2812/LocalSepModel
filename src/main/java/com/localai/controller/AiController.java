package com.localai.controller;

import com.localai.service.ModelManagerService;
import org.springframework.ai.chat.ChatClient;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.ollama.api.OllamaOptions;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class AiController {

    private final ChatClient chatClient;
    private final ModelManagerService modelManager;

    public AiController(ChatClient chatClient, ModelManagerService modelManager) {
        this.chatClient = chatClient;
        this.modelManager = modelManager;
    }

    @PostMapping("/chat")
    public Map<String, String> chat(@RequestBody Map<String, String> request) {
        String userMessage = request.get("message");

        // Dynamically select model
        String modelName = modelManager.getCurrentModel();

        // Passing options to override default model
        Prompt prompt = new Prompt(userMessage, OllamaOptions.create().withModel(modelName));

        String response = chatClient.call(prompt).getResult().getOutput().getContent();
        return Map.of("response", response, "model", modelName);
    }

    @PostMapping("/chat/classify")
    public Map<String, String> classify(@RequestBody Map<String, String> request) {
        String text = request.get("text");
        String promptText = "Classify the following text into a simple category (e.g. Food, Transport, Health, Work, Other). Respond with ONLY the category name.\nText: "
                + text;

        Prompt prompt = new Prompt(promptText, OllamaOptions.create().withModel(ModelManagerService.LITE_MODEL));
        String category = chatClient.call(prompt).getResult().getOutput().getContent();

        return Map.of("category", category.trim());
    }

    @PostMapping("/chat/complexity")
    public Map<String, Object> checkComplexity(@RequestBody Map<String, String> request) {
        String text = request.get("text");
        if (text == null || text.trim().isEmpty()) {
            return Map.of("isComplex", false);
        }

        // Layer 1: Hard Rules (Context Limit)
        // Approx 1 token = 4 chars. 4000 tokens ~= 16000 chars.
        if (text.length() > 16000) {
            return Map.of("isComplex", true, "reason", "Length exceeds context limit");
        }

        // Layer 2: Keyword Scan (Domain & Reasoning)
        String[] keywords = {
                "Compare", "Analyze", "Reason", "Strategy", "Plan",
                "Clause", "Section", "Diagnosis", "Symptoms", "Audit", "Tax Code",
                "Agreement", "Liability", "Prognosis", "Financial Statement"
        };

        String lowerText = text.toLowerCase();
        for (String keyword : keywords) {
            if (lowerText.contains(keyword.toLowerCase())) {
                return Map.of("isComplex", true, "reason", "Keyword content: " + keyword);
            }
        }

        // Layer 3: AI Confidence Check (The "Vibe Check")
        String promptText = "Analyze if the following request requires deep reasoning, complex analysis, or professional knowledge (Legal/Medical). Respond with EXACTLY 'YES' or 'NO'.\nRequest: "
                + text;

        Prompt prompt = new Prompt(promptText, OllamaOptions.create().withModel(ModelManagerService.LITE_MODEL));
        String response = chatClient.call(prompt).getResult().getOutput().getContent().trim().toUpperCase();

        boolean isComplex = response.contains("YES");
        return Map.of("isComplex", isComplex, "reason", "AI Decision");
    }

    // Upgrade Endpoints
    @GetMapping("/upgrade/status")
    public Map<String, Object> getUpgradeStatus() {
        return Map.of(
                "proAvailable", modelManager.isProAvailable(),
                "downloading", modelManager.isDownloading(),
                "currentModel", modelManager.getCurrentModel());
    }

    @PostMapping("/upgrade/start")
    public Map<String, String> startUpgrade() {
        modelManager.startProDownload();
        return Map.of("status", "Download started");
    }

    @PostMapping("/model/switch")
    public Map<String, String> switchModel(@RequestBody Map<String, String> body) {
        String type = body.get("type"); // "lite" or "pro"
        if ("pro".equalsIgnoreCase(type)) {
            modelManager.switchToPro();
        } else {
            modelManager.switchToLite();
        }
        return Map.of("currentModel", modelManager.getCurrentModel());
    }
}
