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
        // Use Lite model for classification to save resources
        String promptText = "Classify the following text into a simple category (e.g. Food, Transport, Health, Work, Other). Respond with ONLY the category name.\nText: "
                + text;

        Prompt prompt = new Prompt(promptText, OllamaOptions.create().withModel(ModelManagerService.LITE_MODEL));
        String category = chatClient.call(prompt).getResult().getOutput().getContent();

        return Map.of("category", category.trim());
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
