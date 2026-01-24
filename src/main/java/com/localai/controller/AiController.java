package com.localai.controller;

import com.localai.service.ModelManagerService;
import com.localai.service.DocumentService;
import com.localai.service.SettingsService;
import com.localai.service.PrivacyService;
import org.springframework.ai.chat.ChatClient;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.ollama.api.OllamaOptions;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.document.Document;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class AiController {

    private final ChatClient chatClient;
    private final ModelManagerService modelManager;
    private final DocumentService documentService;
    private final VectorStore vectorStore;
    private final SettingsService settingsService;
    private final PrivacyService privacyService;

    private final com.localai.service.ProcessingStatusService statusService;

    // Added statusService to constructor
    public AiController(ChatClient chatClient, ModelManagerService modelManager, DocumentService documentService,
            VectorStore vectorStore, SettingsService settingsService, PrivacyService privacyService,
            com.localai.service.ProcessingStatusService statusService) {
        this.chatClient = chatClient;
        this.modelManager = modelManager;
        this.documentService = documentService;
        this.vectorStore = vectorStore;
        this.settingsService = settingsService;
        this.privacyService = privacyService;
        this.statusService = statusService;
    }

    @PostMapping("/docs/upload")
    public Map<String, Object> uploadDocument(@RequestParam("file") MultipartFile file) {
        try {
            // New Async Flow
            String jobId = documentService.initProcess(file);
            return Map.of(
                    "status", "accepted",
                    "message", "Document ingestion started",
                    "jobId", jobId);
        } catch (Throwable e) {
            return Map.of("status", "error", "message", "Failed to start document ingestion: " + e.getMessage());
        }
    }

    @GetMapping("/docs/status/{jobId}")
    public com.localai.service.ProcessingStatusService.JobStatus getJobStatus(@PathVariable String jobId) {
        return statusService.getStatus(jobId);
    }

    @PostMapping("/chat")
    public Map<String, String> chat(@RequestBody Map<String, String> request) {
        String userMessage = request.get("message");

        // --- Privacy Layer ---
        com.localai.model.settings.AppSettings settings = settingsService.getSettings();
        com.localai.model.settings.PrivacyConfig privacyConfig = settings.getPrivacyConfig();

        if (privacyConfig != null) {
            String redactLevel = privacyConfig.getRedactLevel();
            if (redactLevel != null) {
                String redactedMessage = privacyService.redact(userMessage, redactLevel);
                if (!redactedMessage.equals(userMessage)) {
                    System.out.println(
                            "PII Redacted: " + (userMessage.length() - redactedMessage.length()) + " chars hidden.");
                    userMessage = redactedMessage;
                }
            }
        }
        // ---------------------

        String modelName = modelManager.getCurrentModel();

        // RAG: Retrieval Augmented Generation
        // 1. Search for relevant context
        List<Document> similarDocuments = vectorStore.similaritySearch(
                SearchRequest.query(userMessage).withTopK(2));

        StringBuilder context = new StringBuilder();
        if (!similarDocuments.isEmpty()) {
            context.append("\nCONTEXT FROM UPLOADED DOCUMENTS:\n");
            for (Document doc : similarDocuments) {
                context.append(doc.getContent()).append("\n---\n");
            }
        }

        // 2. Construct Prompt with Context
        String systemMsg = settings.getSystemPrompt();
        if (systemMsg == null || systemMsg.isEmpty())
            systemMsg = "You are a helpful AI assistant.";

        if (context.length() > 0) {
            systemMsg += "\nUse the provided context to answer the user's question. If the answer is not in the context, say so, but try to be helpful based on general knowledge.\n"
                    + context.toString();
        }

        SystemMessage systemMessage = new SystemMessage(systemMsg);
        UserMessage userMsg = new UserMessage(userMessage);

        // Fetch Performance Settings
        com.localai.model.settings.PerfConfig perfConfig = settings.getPerfConfig();

        OllamaOptions options = OllamaOptions.create().withModel(modelName);

        if (perfConfig != null) {
            options.withNumCtx(perfConfig.getContextWindow());
            // For threads, we assume it's always set or defaults in the boolean/int logic
            options.withNumThread(perfConfig.getThreadCount());

            // Gpu layers if supported
            // options.withNumGpu(perfConfig.getGpuLayers());
        }

        Prompt prompt = new Prompt(List.of(systemMessage, userMsg), options);

        String response = chatClient.call(prompt).getResult().getOutput().getContent();
        return Map.of("response", response, "model", modelName);
    }

    @PostMapping("/chat/classify")
    public Map<String, String> classify(@RequestBody Map<String, String> request) {
        String text = request.get("text");
        String promptText = "Classify the following text into a simple category (e.g. Food, Transport, Health, Work, Other). Respond with ONLY the category name.\nText: "
                + text;

        Prompt prompt = new Prompt(promptText, OllamaOptions.create().withModel(ModelManagerService.LITE_MODEL));
        String category = chatClient.call(prompt).getResult().getOutput().getContent();

        return Map.of("category", category.trim());
    }

    @PostMapping("/chat/complexity")
    public Map<String, Object> checkComplexity(@RequestBody Map<String, String> request) {
        String text = request.get("text");
        if (text == null || text.trim().isEmpty()) {
            return Map.of("isComplex", false);
        }

        // Layer 1: Hard Rules (Context Limit)
        // Approx 1 token = 4 chars. 4000 tokens ~= 16000 chars.
        if (text.length() > 16000) {
            return Map.of("isComplex", true, "reason", "Length exceeds context limit");
        }

        // Layer 2: Keyword Scan (Domain & Reasoning)
        String[] keywords = {
                "Compare", "Analyze", "Reason", "Strategy", "Plan",
                "Clause", "Section", "Diagnosis", "Symptoms", "Audit", "Tax Code",
                "Agreement", "Liability", "Prognosis", "Financial Statement"
        };

        String lowerText = text.toLowerCase();
        for (String keyword : keywords) {
            if (lowerText.contains(keyword.toLowerCase())) {
                return Map.of("isComplex", true, "reason", "Keyword content: " + keyword);
            }
        }

        // Layer 3: AI Confidence Check (The "Vibe Check")
        String promptText = "Analyze if the following request requires deep reasoning, complex analysis, or professional knowledge (Legal/Medical). Respond with EXACTLY 'YES' or 'NO'.\nRequest: "
                + text;

        // Fetch Performance Settings
        com.localai.model.settings.AppSettings settings = settingsService.getSettings();
        com.localai.model.settings.PerfConfig perfConfig = settings.getPerfConfig();

        OllamaOptions options = OllamaOptions.create().withModel(ModelManagerService.LITE_MODEL);

        if (perfConfig != null) {
            // Use same settings but maybe lighter context for classification?
            // For now, respect global settings.
            options.withNumCtx(perfConfig.getContextWindow());
            // GPU layers omitted until method confirmed
            options.withNumThread(perfConfig.getThreadCount());
        }

        Prompt prompt = new Prompt(promptText, options);
        String response = chatClient.call(prompt).getResult().getOutput().getContent().trim().toUpperCase();

        boolean isComplex = response.contains("YES");
        return Map.of("isComplex", isComplex, "reason", "AI Decision");
    }

    // Upgrade Endpoints
    @GetMapping("/upgrade/status")
    public Map<String, Object> getUpgradeStatus() {
        return Map.of(
                "proAvailable", modelManager.isProAvailable(),
                "downloading", modelManager.isDownloading(),
                "currentModel", modelManager.getCurrentModel());
    }

    @PostMapping("/upgrade/start")
    public Map<String, String> startUpgrade() {
        modelManager.startProDownload();
        return Map.of("status", "Download started");
    }

    @PostMapping("/model/switch")
    public Map<String, String> switchModel(@RequestBody Map<String, String> body) {
        String type = body.get("type"); // "lite" or "pro"
        if ("pro".equalsIgnoreCase(type)) {
            modelManager.switchToPro();
        } else {
            modelManager.switchToLite();
        }
        return Map.of("currentModel", modelManager.getCurrentModel());
    }
}
