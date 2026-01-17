package com.localai.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.concurrent.CompletableFuture;

@Service
public class ModelManagerService {

    private static final Logger logger = LoggerFactory.getLogger(ModelManagerService.class);
    private final DownloaderService downloaderService;

    // Model Constants
    public static final String LITE_MODEL = "qwen2.5:0.5b";
    // Using a quantized Llama 3 or Mistral as Pro model.
    // In a real scenario, this would be a direct download link to a GGUF file.
    // For this plan, we might simulate it or use a real URL if user provided one.
    // Placeholder URL for now or a large test file.
    private static final String PRO_MODEL_URL = "https://huggingface.co/TheBloke/Mistral-7B-Instruct-v0.2-GGUF/resolve/main/mistral-7b-instruct-v0.2.Q4_K_M.gguf";
    public static final String PRO_MODEL_FILENAME = "mistral-7b-instruct-v0.2.Q4_K_M.gguf";
    public static final String PRO_MODEL_NAME = "mistral:7b-quant"; // Name to register in Ollama if using Modelfile, or
                                                                    // filename path

    private boolean isDownloading = false;
    private String currentModel = LITE_MODEL;

    @Value("${app.models.path:models}")
    private String modelsPath;

    public ModelManagerService(DownloaderService downloaderService) {
        this.downloaderService = downloaderService;
    }

    public String getCurrentModel() {
        return currentModel;
    }

    public boolean isProAvailable() {
        // logic: check if file exists in hidden folder
        String fullPath = getProModelPath();
        return new File(fullPath).exists() && new File(fullPath).length() > 0;
    }

    public void startProDownload() {
        if (isDownloading || isProAvailable()) {
            return;
        }
        isDownloading = true;
        CompletableFuture.runAsync(() -> {
            try {
                String dest = getProModelPath();
                logger.info("Starting Pro model download to: {}", dest);
                downloaderService.downloadFile(PRO_MODEL_URL, dest);
                logger.info("Pro model download completed.");
                // Note: To use this .gguf with Ollama, we usually need to create a Modelfile
                // and run `ollama create`.
                // For simplicity in this phase, we might just mark it as available.
                // The actual integration step would be: `ollama create mistral:7b-quant -f
                // Modelfile`
            } catch (Exception e) {
                logger.error("Pro model download failed", e);
            } finally {
                isDownloading = false;
            }
        });
    }

    public void switchToPro() {
        if (isProAvailable()) {
            // In a real Ollama setup with a raw GGUF, we'd need to ensure it's loaded.
            // For now, let's assume valid registration.
            this.currentModel = PRO_MODEL_NAME;
            logger.info("Switched to Pro Model: {}", PRO_MODEL_NAME);
        } else {
            throw new IllegalStateException("Pro model not available yet.");
        }
    }

    public void switchToLite() {
        this.currentModel = LITE_MODEL;
        logger.info("Switched to Lite Model: {}", LITE_MODEL);
    }

    public boolean isDownloading() {
        return isDownloading;
    }

    private String getProModelPath() {
        // AppData/Roaming/... or similar logic.
        // For simplicity, using a specific folder relative to run for now or user home.
        String userHome = System.getProperty("user.home");
        Path hiddenDir = Paths.get(userHome, "AppData", "Roaming", "LocalAI", "models");
        return hiddenDir.resolve(PRO_MODEL_FILENAME).toString();
    }
}
