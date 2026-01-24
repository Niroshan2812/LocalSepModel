package com.localai.model.settings;

import java.util.HashMap;
import java.util.Map;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class AppSettings {
    private Map<String, AgentConfig> agentConfigs = new HashMap<>(); // key: finance, health, legal
    private String systemPrompt = "Call me 'Sir', be concise, never use emojis.";
    private PerfConfig perfConfig = new PerfConfig();
    private PrivacyConfig privacyConfig = new PrivacyConfig();

    public Map<String, AgentConfig> getAgentConfigs() {
        return agentConfigs;
    }

    public void setAgentConfigs(Map<String, AgentConfig> agentConfigs) {
        this.agentConfigs = agentConfigs;
    }

    public String getSystemPrompt() {
        return systemPrompt;
    }

    public void setSystemPrompt(String systemPrompt) {
        this.systemPrompt = systemPrompt;
    }

    public PerfConfig getPerfConfig() {
        return perfConfig;
    }

    public void setPerfConfig(PerfConfig perfConfig) {
        this.perfConfig = perfConfig;
    }

    public PrivacyConfig getPrivacyConfig() {
        return privacyConfig;
    }

    public void setPrivacyConfig(PrivacyConfig privacyConfig) {
        this.privacyConfig = privacyConfig;
    }
}
