package com.localai.controller;

import com.localai.model.JournalEntry;
import com.localai.service.HealthService;
import com.localai.service.ModelManagerService;
import org.springframework.ai.chat.ChatClient;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.ollama.api.OllamaOptions;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/health")
public class HealthController {

    private final HealthService healthService;
    private final ChatClient chatClient;
    private final ModelManagerService modelManager;

    public HealthController(HealthService healthService, ChatClient chatClient, ModelManagerService modelManager) {
        this.healthService = healthService;
        this.chatClient = chatClient;
        this.modelManager = modelManager;
    }

    @PostMapping("/journal")
    public Map<String, Object> addEntry(@RequestBody Map<String, String> request) {
        String content = request.get("content");
        String password = request.get("password");

        try {
            JournalEntry entry = healthService.createEntry(content, password);
            // Return decrypted version immediately to UI
            return Map.of("status", "success", "entry",
                    new HealthService.DecryptedEntry(entry.getId(), entry.getTimestamp(), content, entry.getMood(),
                            entry.getSentimentScore()));
        } catch (Exception e) {
            return Map.of("status", "error", "message", e.getMessage());
        }
    }

    @PostMapping("/journal/unlock")
    public Map<String, Object> unlockJournal(@RequestBody Map<String, String> request) {
        String password = request.get("password");
        try {
            List<JournalEntry> all = healthService.getEntries(password);
            List<HealthService.DecryptedEntry> decrypted = healthService.decryptEntries(all, password);
            return Map.of("status", "success", "entries", decrypted);
        } catch (Exception e) {
            return Map.of("status", "error", "message", "Unlock failed or no data");
        }
    }

    @PostMapping("/chat")
    public Map<String, String> therapyChat(@RequestBody Map<String, String> request) {
        String message = request.get("message");

        // CRITICAL SAFETY GUARDRAIL
        String lowerMsg = message.toLowerCase();
        if (lowerMsg.contains("suicide") || lowerMsg.contains("kill myself") || lowerMsg.contains("want to die")
                || lowerMsg.contains("end it all") || lowerMsg.contains("self-harm")) {
            return Map.of("response",
                    "PLEASE STOP. If you are in danger, please call emergency services immediately.\n\n" +
                            "🇺🇸 USA: 988 (Suicide & Crisis Lifeline)\n" +
                            "🇬🇧 UK: 111 or 999\n" +
                            "🇨🇦 Canada: 988\n\n" +
                            "You are not alone. Please reach out to a professional.");
        }

        // Pro Task: Therapist Persona
        String systemPrompt = "You are a compassionate, licensed therapist. Your goal is to listen effectively and identify cognitive distortions (like catastrophizing, black-and-white thinking). Respond with empathy. Keep responses concise.";

        // Dynamic Model Selection (Pro preferred)
        String model = modelManager.getCurrentModel();

        // Assuming a simple chat call for now. In a full app, we'd pass history.
        String fullPrompt = systemPrompt + "\nUser: " + message + "\nTherapist:";

        Prompt prompt = new Prompt(fullPrompt, OllamaOptions.create().withModel(model));
        String response = chatClient.call(prompt).getResult().getOutput().getContent();

        return Map.of("response", response);
    }
}
