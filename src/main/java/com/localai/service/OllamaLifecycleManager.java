package com.localai.service;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.net.Socket;

@Service
public class OllamaLifecycleManager {

    private static final Logger logger = LoggerFactory.getLogger(OllamaLifecycleManager.class);
    private static final int OLLAMA_PORT = 11434;
    private Process ollamaProcess;

    @PostConstruct
    public void startOllama() {
        if (isOllamaRunning()) {
            logger.info("Ollama is already running on port {}", OLLAMA_PORT);
            return;
        }

        logger.info("Ollama not found on port {}. Attempting to start...", OLLAMA_PORT);
        try {
            startOllamaProcess();
        } catch (IOException e) {
            logger.error("Failed to start Ollama process. Please ensure Ollama is installed or bundled.", e);
            // Don't crash the app, just log. The user might have it running elsewhere or
            // we'll handle it in UI.
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
        // Inherit IO to show output in console for now, or redirect to null to hide
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
                // Determine OS to force kill if needed?
                // For now, destroy() is usually SIGTERM.
                ollamaProcess.waitFor();
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
            logger.info("Ollama process stopped.");
        }
    }
}
