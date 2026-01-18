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

        String modelName = modelManager.getCurrentModel();

        Prompt prompt = new Prompt(promptBuilder.toString(), OllamaOptions.create().withModel(modelName));
        String response = chatClient.call(prompt).getResult().getOutput().getContent();

        return Map.of("analysis", response);
    }

    @PostMapping("/category/update")
    public Map<String, String> updateCategory(@RequestBody Map<String, String> request) {
        String keyword = request.get("keyword");
        String category = request.get("category");
        financeService.updateCategoryRule(keyword, category);
        return Map.of("status", "success", "message", "Rule updated. Re-upload CSV to see changes.");
    }

    @PostMapping("/subscriptions")
    public Map<String, Object> findSubscriptions(@RequestBody Map<String, List<Transaction>> request) {
        List<Transaction> transactions = request.get("transactions"); // In real app, might just pass IDs or re-upload,
                                                                      // but this is okay for prototype
        // Note: passing complex objects in JSON requires Jackson setup, might fail if
        // Transaction doesn't have default constructor or if format doesn't match.
        // Better: We might assume state is stateless and user sends back the
        // transactions list or we cache it in Service (but service is singleton).
        // For this prototype, I'll rely on frontend sending the data back.

        // Wait: The Transaction object likely maps fine if fields match.

        // Actually, to avoid mapping issues, let's just accept the list if the frontend
        // sends it exactly as received.
        // OR better: Just re-upload file for deep analysis? No, that's bad UX.
        // Let's assume the frontend sends the *list* of transactions it got from
        // /upload.

        List<String> subs = financeService.detectSubscriptions(transactions);
        return Map.of("subscriptions", subs);
    }

    @PostMapping("/forecast")
    public Map<String, Object> forecastRunway(@RequestBody Map<String, Object> request) {
        double balance = Double.parseDouble(request.get("balance").toString());
        List<Map<String, Object>> rawTransactions = (List<Map<String, Object>>) request.get("transactions");

        // Manual mapping needed if Jackson doesn't auto-map to Transaction class from
        // generic map
        List<Transaction> transactions = rawTransactions.stream().map(m -> new Transaction(
                java.time.LocalDate.parse((String) m.get("date")),
                (String) m.get("description"),
                ((Number) m.get("amount")).doubleValue(),
                (String) m.get("category"))).collect(Collectors.toList());

        int days = financeService.forecastRunway(balance, transactions);

        // LLM Commentary
        String modelName = modelManager.getCurrentModel();
        String promptText = String.format(
                "User has %d days of financial runway left based on current spending. Current Balance: %.2f. Give a 1-sentence financial reality check.",
                days, balance);

        String commentary = "Calculated.";
        try {
            commentary = chatClient.call(new Prompt(promptText, OllamaOptions.create().withModel(modelName)))
                    .getResult().getOutput().getContent();
        } catch (Exception e) {
            commentary = "Runway calculated.";
        }

        return Map.of("days", days, "commentary", commentary);
    }
}
