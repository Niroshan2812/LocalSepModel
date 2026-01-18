package com.localai.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class SettingsService {

    private static final String SETTINGS_FILE = "settings.json";
    private final ObjectMapper objectMapper;
    private final Map<String, Object> cachedSettings;

    public SettingsService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        this.cachedSettings = new ConcurrentHashMap<>();
        loadSettings();
    }

    public Map<String, Object> getSettings() {
        return new HashMap<>(cachedSettings);
    }

    public synchronized void saveSettings(Map<String, Object> newSettings) {
        cachedSettings.putAll(newSettings);
        try {
            objectMapper.writerWithDefaultPrettyPrinter().writeValue(new File(SETTINGS_FILE), cachedSettings);
        } catch (IOException e) {
            e.printStackTrace();
            // In production, use a logger
        }
    }

    public synchronized void resetSettings() {
        cachedSettings.clear();
        cachedSettings.putAll(getDefaultSettings());
        saveSettings(cachedSettings);
    }

    @SuppressWarnings("unchecked")
    private void loadSettings() {
        File file = new File(SETTINGS_FILE);
        if (file.exists()) {
            try {
                Map<String, Object> loaded = objectMapper.readValue(file, Map.class);
                cachedSettings.putAll(loaded);
            } catch (IOException e) {
                e.printStackTrace();
                cachedSettings.putAll(getDefaultSettings()); // Fallback
            }
        } else {
            cachedSettings.putAll(getDefaultSettings());
            saveSettings(cachedSettings); // Create file with defaults
        }
    }

    private Map<String, Object> getDefaultSettings() {
        Map<String, Object> defaults = new HashMap<>();

        // Agent Configs
        Map<String, Object> agents = new HashMap<>();
        agents.put("finance", Map.of("model", "Llama-3-Finance", "personality", 80));
        agents.put("health", Map.of("model", "Mistral-OpenOrca", "personality", 20));
        agents.put("legal", Map.of("model", "Phi-3-Mini", "personality", 90));
        defaults.put("agentConfigs", agents);

        // System Prompt
        defaults.put("systemPrompt", "Call me 'Sir', be concise, never use emojis.");

        // Performance
        Map<String, Object> perf = new HashMap<>();
        perf.put("contextWindow", 4096);
        perf.put("gpuEnabled", true);
        perf.put("gpuLayers", 25);
        perf.put("threadMode", "auto");
        perf.put("threadCount", 4);
        defaults.put("perfConfig", perf);

        // Privacy
        Map<String, Object> privacy = new HashMap<>();
        privacy.put("anonymizeLogs", false);
        privacy.put("localOnlyMode", true);
        privacy.put("retentionFinance", "24h");
        privacy.put("retentionHealth", "never");
        privacy.put("redactLevel", "high");
        defaults.put("privacyConfig", privacy);

        return defaults;
    }
}
