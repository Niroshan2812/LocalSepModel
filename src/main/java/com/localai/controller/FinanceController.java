package com.localai.controller;

import com.localai.model.Transaction;
import com.localai.service.FinanceService;
import com.localai.service.ModelManagerService;
import org.springframework.ai.chat.ChatClient;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.ollama.api.OllamaOptions;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/finance")
public class FinanceController {

    private final FinanceService financeService;
    private final ChatClient chatClient;
    private final ModelManagerService modelManager;

    public FinanceController(FinanceService financeService, ChatClient chatClient, ModelManagerService modelManager) {
        this.financeService = financeService;
        this.chatClient = chatClient;
        this.modelManager = modelManager;
    }

    @PostMapping("/upload")
    public Map<String, Object> uploadStatement(@RequestParam("file") MultipartFile file) {
        try {
            List<Transaction> transactions = financeService.parseCsv(file);
            Map<String, Double> totals = financeService.calculateCategoryTotals(transactions);

            return Map.of(
                    "status", "success",
                    "transactions", transactions.stream().limit(50).collect(Collectors.toList()), // Limit for UI
                                                                                                  // performance
                    "totals", totals,
                    "count", transactions.size());
        } catch (Exception e) {
            return Map.of("status", "error", "message", "Failed to process CSV: " + e.getMessage());
        }
    }

    @PostMapping("/analyze")
    public Map<String, String> analyzeFinances(@RequestBody Map<String, Object> request) {
        // Pro Task: Send summarized data to LLM
        Map<String, Number> totals = (Map<String, Number>) request.get("totals");

        StringBuilder promptBuilder = new StringBuilder();
        promptBuilder.append(
                "You are a helpful Private Finance Analyst. The user has provided their spending summary by category:\n");
        totals.forEach((k, v) -> promptBuilder.append("- ").append(k).append(": $").append(v).append("\n"));
        promptBuilder.append(
                "\nAnalyze this spending. Identify the largest expense category. Provide 3 actionable tips to save money based on these categories. Be concise and friendly.");

        String modelName = modelManager.getCurrentModel(); // Ideally should be Pro for better advice, but works with
                                                           // Lite

        Prompt prompt = new Prompt(promptBuilder.toString(), OllamaOptions.create().withModel(modelName));
        String response = chatClient.call(prompt).getResult().getOutput().getContent();

        return Map.of("analysis", response);
    }
}
