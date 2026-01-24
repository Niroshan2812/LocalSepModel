package com.localai.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.localai.model.settings.AgentConfig;
import com.localai.model.settings.AppSettings;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Service
public class SettingsService {

    private static final String SETTINGS_FILE = "settings.json";
    private final ObjectMapper objectMapper;
    private AppSettings cachedSettings;

    public SettingsService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        // Initialize with defaults in case load fails
        this.cachedSettings = new AppSettings();
        loadSettings();
    }

    public synchronized AppSettings getSettings() {
        return cachedSettings;
    }

    public synchronized void saveSettings(AppSettings newSettings) {
        this.cachedSettings = newSettings;
        try {
            objectMapper.writerWithDefaultPrettyPrinter().writeValue(new File(SETTINGS_FILE), cachedSettings);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public synchronized void resetSettings() {
        this.cachedSettings = getDefaultSettings();
        saveSettings(this.cachedSettings);
    }

    private void loadSettings() {
        File file = new File(SETTINGS_FILE);
        if (file.exists()) {
            try {
                this.cachedSettings = objectMapper.readValue(file, AppSettings.class);
            } catch (IOException e) {
                e.printStackTrace();
                this.cachedSettings = getDefaultSettings();
            }
        } else {
            this.cachedSettings = getDefaultSettings();
            saveSettings(this.cachedSettings); // Create file with defaults
        }
    }

    private AppSettings getDefaultSettings() {
        AppSettings defaults = new AppSettings();

        // Agents
        Map<String, AgentConfig> agents = new HashMap<>();
        agents.put("finance", new AgentConfig("Llama-3-Finance", 80));
        agents.put("health", new AgentConfig("Mistral-OpenOrca", 20));
        agents.put("legal", new AgentConfig("Phi-3-Mini", 90));
        defaults.setAgentConfigs(agents);

        // Others are set by default scalars in AppSettings/Privacy/Perf classes
        return defaults;
    }
}
