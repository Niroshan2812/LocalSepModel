package com.localai.model.settings;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class PrivacyConfig {
    private boolean anonymizeLogs = false;
    private boolean localOnlyMode = true;
    private String retentionFinance = "24h";
    private String retentionHealth = "never";
    private String redactLevel = "high"; // none, basic, high

    public boolean isAnonymizeLogs() {
        return anonymizeLogs;
    }

    public void setAnonymizeLogs(boolean anonymizeLogs) {
        this.anonymizeLogs = anonymizeLogs;
    }

    public boolean isLocalOnlyMode() {
        return localOnlyMode;
    }

    public void setLocalOnlyMode(boolean localOnlyMode) {
        this.localOnlyMode = localOnlyMode;
    }

    public String getRetentionFinance() {
        return retentionFinance;
    }

    public void setRetentionFinance(String retentionFinance) {
        this.retentionFinance = retentionFinance;
    }

    public String getRetentionHealth() {
        return retentionHealth;
    }

    public void setRetentionHealth(String retentionHealth) {
        this.retentionHealth = retentionHealth;
    }

    public String getRedactLevel() {
        return redactLevel;
    }

    public void setRedactLevel(String redactLevel) {
        this.redactLevel = redactLevel;
    }
}
