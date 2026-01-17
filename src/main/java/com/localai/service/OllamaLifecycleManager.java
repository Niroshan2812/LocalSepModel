package com.localai.service;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.io.File;
import java.io.IOException;
import java.net.Socket;
import java.util.Map;

@Service
public class OllamaLifecycleManager {

    private static final Logger logger = LoggerFactory.getLogger(OllamaLifecycleManager.class);
    private static final int OLLAMA_PORT = 11434;
    private Process ollamaProcess;
    private static final String LITE_MODEL = "qwen2.5:0.5b";
    private static final String EMBEDDING_MODEL = "nomic-embed-text";
    private final RestClient restClient = RestClient.create("http://localhost:" + OLLAMA_PORT);

    @PostConstruct
    public void startOllama() {
        if (isOllamaRunning()) {
            logger.info("Ollama is already running on port {}", OLLAMA_PORT);
        } else {
            logger.info("Ollama not found on port {}. Attempting to start...", OLLAMA_PORT);
            try {
                startOllamaProcess();
            } catch (IOException e) {
                logger.error("Failed to start Ollama process.", e);
                return;
            }
        }

        // Check models
        ensureModelReady(LITE_MODEL);
        ensureModelReady(EMBEDDING_MODEL);
    }

    private void ensureModelReady(String modelName) {
        logger.info("Checking for model: {}", modelName);
        try {
            String response = restClient.get()
                    .uri("/api/tags")
                    .retrieve()
                    .body(String.class);
            if (response != null && response.contains(modelName)) {
                logger.info("Model is ready: {}", modelName);

            } else {
                logger.warn("Model '{}' is missing. Starting auto-download.", modelName);
                pullModel(modelName);
            }
        } catch (Exception e) {
            logger.error("Failed to communicate with Ollama API to check models.", e);
        }
    }

    private void pullModel(String modelName) {
        logger.info("Starting download for model: {}", modelName);
        try {
            Map<String, String> request = Map.of("name", modelName);

            restClient.post()
                    .uri("/api/pull")
                    .body(request)
                    .exchange((req, res) -> {
                        if (res.getStatusCode().is2xxSuccessful()) {
                            try (java.io.BufferedReader reader = new java.io.BufferedReader(
                                    new java.io.InputStreamReader(res.getBody()))) {
                                String line;
                                while ((line = reader.readLine()) != null) {
                                    if (line.contains("\"status\"")) {
                                        System.out.println("[Ollama] " + line);
                                    }
                                }
                            }
                        } else {
                            logger.error("Ollama pull failed with status: " + res.getStatusCode());
                        }
                        return null;
                    });

            logger.info("Model pulled successfully: {}", modelName);
        } catch (Exception e) {
            logger.error("Failed to download model: " + modelName, e);
        }
    }

    private boolean isOllamaRunning() {
        try (Socket socket = new Socket("localhost", OLLAMA_PORT)) {
            return true;
        } catch (IOException e) {
            return false;
        }
    }

    private void startOllamaProcess() throws IOException {
        String command = "ollama";

        // Check for bundled binary first: ./bin/ollama.exe
        File localBin = new File("bin/ollama.exe");
        if (localBin.exists()) {
            command = localBin.getAbsolutePath();
            logger.info("Found bundled Ollama: {}", command);
        } else {
            logger.info("Using system Ollama command");
        }

        ProcessBuilder pb = new ProcessBuilder(command, "serve");
        pb.redirectErrorStream(true);
        // Removed incorrect mkdirs on command string
        pb.redirectOutput(ProcessBuilder.Redirect.INHERIT);

        ollamaProcess = pb.start();
        logger.info("Ollama started successfully. PID: {}", ollamaProcess.pid());

        // Give it a moment to initialize
        try {
            Thread.sleep(2000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }

    @PreDestroy
    public void stopOllama() {
        if (ollamaProcess != null && ollamaProcess.isAlive()) {
            logger.info("Stopping local Ollama process...");
            ollamaProcess.destroy();
            try {
                if (System.getProperty("os.name").toLowerCase().contains("win")) {
                    // Force kill on windows if needed or just wait
                    // ollamaProcess.destroyForcibly();
                    // Using taskkill might be overkill if destroy works, but keeping user intent if
                    // valid
                    new ProcessBuilder("taskkill", "/F", "/IM", "ollama.exe").start().waitFor();
                } else {
                    ollamaProcess.waitFor();
                }
            } catch (InterruptedException | IOException e) {
                Thread.currentThread().interrupt();
                logger.error("Error stopping Ollama", e);
            }
            logger.info("Ollama process stopped.");
        }
    }
}
