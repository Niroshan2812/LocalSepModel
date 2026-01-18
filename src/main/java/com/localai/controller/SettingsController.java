package com.localai.controller;

import com.localai.service.SettingsService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/settings")
public class SettingsController {

    private final SettingsService settingsService;
    private final com.localai.service.ModelManagerService modelManagerService;

    public SettingsController(SettingsService settingsService,
            com.localai.service.ModelManagerService modelManagerService) {
        this.settingsService = settingsService;
        this.modelManagerService = modelManagerService;
    }

    @GetMapping("/models")
    public java.util.List<String> getModels() {
        return modelManagerService.getAvailableModels();
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
}
