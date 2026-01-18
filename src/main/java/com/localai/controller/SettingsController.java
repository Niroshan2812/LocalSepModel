package com.localai.controller;

import com.localai.service.SettingsService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/settings")
public class SettingsController {

    private final SettingsService settingsService;
    private final com.localai.service.ModelManagerService modelManagerService;
    private final com.localai.service.DocumentService documentService;

    public SettingsController(SettingsService settingsService,
            com.localai.service.ModelManagerService modelManagerService,
            com.localai.service.DocumentService documentService) {
        this.settingsService = settingsService;
        this.modelManagerService = modelManagerService;
        this.documentService = documentService;
    }

    @GetMapping("/models")
    public java.util.List<java.util.Map<String, Object>> getModels() {
        return modelManagerService.getAvailableModels();
    }

    @PostMapping("/pull")
    public Map<String, Object> pullModel(@RequestBody Map<String, String> payload) {
        String modelName = payload.get("model");
        if (modelName == null || modelName.isEmpty()) {
            return Map.of("status", "error", "message", "Model name is required");
        }
        modelManagerService.pullModel(modelName);
        return Map.of("status", "success", "message", "Pull initiated for " + modelName);
    }

    @GetMapping("/downloads")
    public java.util.List<java.util.Map<String, Object>> getDownloads() {
        return modelManagerService.getActiveDownloads();
    }

    @PostMapping("/downloads/cancel")
    public Map<String, Object> cancelDownload(@RequestBody Map<String, String> payload) {
        String modelName = payload.get("model");
        if (modelName == null || modelName.isEmpty()) {
            return Map.of("status", "error", "message", "Model name is required");
        }
        modelManagerService.cancelPull(modelName);
        return Map.of("status", "success", "message", "Cancelled download for " + modelName);
    }

    @GetMapping
    public Map<String, Object> getSettings() {
        return settingsService.getSettings();
    }

    @PostMapping
    public Map<String, Object> saveSettings(@RequestBody Map<String, Object> newSettings) {
        settingsService.saveSettings(newSettings);
        return Map.of("status", "success", "message", "Settings saved successfully");
    }

    @PostMapping("/reset")
    public Map<String, Object> resetSettings() {
        settingsService.resetSettings();
        return Map.of("status", "success", "message", "Settings reset to defaults");
    }

    @PostMapping("/nuke")
    public Map<String, Object> nukeContext() {
        documentService.clearStore();
        return Map.of("status", "success", "message",
                "Context Nuked (Persistence Cleared). Restart for full memory wipe.");
    }
}
