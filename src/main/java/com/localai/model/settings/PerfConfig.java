package com.localai.model.settings;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class PerfConfig {
    private int contextWindow = 4096;
    private boolean gpuEnabled = true;
    private int gpuLayers = 25;
    private String threadMode = "auto";
    private int threadCount = 4;

    public int getContextWindow() {
        return contextWindow;
    }

    public void setContextWindow(int contextWindow) {
        this.contextWindow = contextWindow;
    }

    public boolean isGpuEnabled() {
        return gpuEnabled;
    }

    public void setGpuEnabled(boolean gpuEnabled) {
        this.gpuEnabled = gpuEnabled;
    }

    public int getGpuLayers() {
        return gpuLayers;
    }

    public void setGpuLayers(int gpuLayers) {
        this.gpuLayers = gpuLayers;
    }

    public String getThreadMode() {
        return threadMode;
    }

    public void setThreadMode(String threadMode) {
        this.threadMode = threadMode;
    }

    public int getThreadCount() {
        return threadCount;
    }

    public void setThreadCount(int threadCount) {
        this.threadCount = threadCount;
    }
}
