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

    public java.util.List<java.util.Map<String, Object>> getAvailableModels() {
        try {
            java.net.http.HttpClient client = java.net.http.HttpClient.newHttpClient();
            java.net.http.HttpRequest request = java.net.http.HttpRequest.newBuilder()
                    .uri(java.net.URI.create("http://localhost:11434/api/tags"))
                    .GET()
                    .build();

            java.net.http.HttpResponse<String> response = client.send(request,
                    java.net.http.HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200) {
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                com.fasterxml.jackson.databind.JsonNode root = mapper.readTree(response.body());
                java.util.List<java.util.Map<String, Object>> models = new java.util.ArrayList<>();
                if (root.has("models")) {
                    for (com.fasterxml.jackson.databind.JsonNode node : root.get("models")) {
                        java.util.Map<String, Object> modelInfo = new java.util.HashMap<>();
                        modelInfo.put("name", node.get("name").asText());

                        // Parse size safely
                        long sizeBytes = node.has("size") ? node.get("size").asLong() : 0;
                        double sizeGb = sizeBytes / (1024.0 * 1024.0 * 1024.0);
                        modelInfo.put("size", String.format("%.1f GB", sizeGb));

                        if (node.has("details")) {
                            com.fasterxml.jackson.databind.JsonNode details = node.get("details");
                            String quant = details.has("quantization_level")
                                    ? details.get("quantization_level").asText()
                                    : "Unknown";
                            String family = details.has("family") ? details.get("family").asText() : "";
                            String params = details.has("parameter_size") ? details.get("parameter_size").asText() : "";

                            modelInfo.put("quant", quant);
                            modelInfo.put("family", family);
                            modelInfo.put("details", params + " " + quant);
                        } else {
                            modelInfo.put("quant", "Unknown");
                            modelInfo.put("family", "Unknown");
                            modelInfo.put("details", "");
                        }

                        models.add(modelInfo);
                    }
                }
                return models;
            }
        } catch (Exception e) {
            logger.error("Failed to fetch models from Ollama", e);
        }
        // Fallback
        return new java.util.ArrayList<>();
    }

    private final java.util.concurrent.ConcurrentHashMap<String, java.util.Map<String, Object>> activeDownloads = new java.util.concurrent.ConcurrentHashMap<>();
    private final java.util.concurrent.ConcurrentHashMap<String, CompletableFuture<Void>> activePullFutures = new java.util.concurrent.ConcurrentHashMap<>();

    public void pullModel(String modelName) {
        if (activePullFutures.containsKey(modelName)) {
            logger.info("Model {} is already downloading.", modelName);
            return;
        }

        CompletableFuture<Void> future = CompletableFuture.runAsync(() -> {
            try {
                logger.info("Initiating streaming pull for model: {}", modelName);
                java.net.http.HttpClient client = java.net.http.HttpClient.newHttpClient();
                // stream: true for progress updates
                String jsonBody = String.format("{\"name\": \"%s\", \"stream\": true}", modelName);

                java.net.http.HttpRequest request = java.net.http.HttpRequest.newBuilder()
                        .uri(java.net.URI.create("http://localhost:11434/api/pull"))
                        .POST(java.net.http.HttpRequest.BodyPublishers.ofString(jsonBody))
                        .header("Content-Type", "application/json")
                        .build();

                // Streaming response
                client.send(request, java.net.http.HttpResponse.BodyHandlers.ofLines())
                        .body()
                        .forEach(line -> {
                            if (Thread.currentThread().isInterrupted()) {
                                throw new RuntimeException("Download interrupted");
                            }
                            try {
                                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                                com.fasterxml.jackson.databind.JsonNode node = mapper.readTree(line);

                                java.util.Map<String, Object> status = new java.util.HashMap<>();
                                status.put("name", modelName);
                                status.put("status", node.has("status") ? node.get("status").asText() : "downloading");

                                if (node.has("total") && node.has("completed")) {
                                    long total = node.get("total").asLong();
                                    long completed = node.get("completed").asLong();
                                    double progress = (double) completed / total * 100;
                                    status.put("progress", (int) progress);
                                    status.put("total", total);
                                    status.put("completed", completed);

                                    // Simple speed/eta calculation could go here (omitted for brevity)
                                    status.put("speed", "Downloading..."); // Placeholder
                                    status.put("eta", "..."); // Placeholder
                                } else {
                                    // Initial phases (pulling manifest) might not have total/completed
                                    status.put("progress", 0);
                                    status.put("speed", "Initializing...");
                                    status.put("eta", "...");
                                }

                                activeDownloads.put(modelName, status);

                                if (node.has("status") && "success".equals(node.get("status").asText())) {
                                    logger.info("Download complete for {}", modelName);
                                    activeDownloads.remove(modelName);
                                }
                            } catch (Exception e) {
                                logger.error("Error parsing streaming response for " + modelName, e);
                            }
                        });

            } catch (Exception e) {
                logger.error("Error pulling model: " + modelName, e);
            } finally {
                activeDownloads.remove(modelName);
                activePullFutures.remove(modelName);
            }
        });

        activePullFutures.put(modelName, future);
    }

    public void cancelPull(String modelName) {
        CompletableFuture<Void> future = activePullFutures.get(modelName);
        if (future != null) {
            future.cancel(true); // Interrupt
            activePullFutures.remove(modelName);
            activeDownloads.remove(modelName);
            logger.info("Cancelled download for {}", modelName);
        }
    }

    public java.util.List<java.util.Map<String, Object>> getActiveDownloads() {
        return new java.util.ArrayList<>(activeDownloads.values());
    }

    private String getProModelPath() {
        // AppData/Roaming/... or similar logic.
        // For simplicity, using a specific folder relative to run for now or user home.
        String userHome = System.getProperty("user.home");
        // Use a hidden folder in user home for cross-platform compatibility
        Path hiddenDir = Paths.get(userHome, ".localai", "models");
        return hiddenDir.resolve(PRO_MODEL_FILENAME).toString();
    }
}
