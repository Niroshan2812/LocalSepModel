package com.localai.model.settings;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class AgentConfig {
    private String model;
    private int personality; // 0-100

    public AgentConfig() {
    }

    public AgentConfig(String model, int personality) {
        this.model = model;
        this.personality = personality;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public int getPersonality() {
        return personality;
    }

    public void setPersonality(int personality) {
        this.personality = personality;
    }
}
