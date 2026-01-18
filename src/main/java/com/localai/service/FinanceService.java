package com.localai.service;

import com.localai.model.Transaction;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Locale;

@Service
public class FinanceService {

    private static final Logger logger = LoggerFactory.getLogger(FinanceService.class);

    // Dynamic Categorization Rules
    private final Map<String, List<String>> categoryRules = new HashMap<>();

    public FinanceService() {
        // Initialize default rules
        addRule("Food", "restaurant", "cafe", "coffee", "burger", "pizza", "kfc", "mcdonalds", "grocery",
                "supermarket");
        addRule("Transport", "uber", "lyft", "taxi", "bus", "train", "fuel", "gas", "shell", "parking");
        addRule("Utilities", "electric", "water", "internet", "phone", "mobile", "utility", "bill");
        addRule("Shopping", "amazon", "walmart", "target", "clothing", "shoe", "store");
        addRule("Entertainment", "netflix", "spotify", "movie", "cinema", "game", "steam");
    }

    public void addRule(String category, String... keywords) {
        categoryRules.computeIfAbsent(category, k -> new ArrayList<>()).addAll(List.of(keywords));
    }

    public void updateCategoryRule(String keyword, String newCategory) {
        // Remove keyword from old category if exists
        categoryRules.values().forEach(list -> list.remove(keyword.toLowerCase()));

        // Add to new category
        addRule(newCategory, keyword.toLowerCase());
    }

    public List<Transaction> parseCsv(MultipartFile file) throws IOException {
        List<Transaction> transactions = new ArrayList<>();

        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8));
                CSVParser csvParser = new CSVParser(reader,
                        CSVFormat.DEFAULT.withFirstRecordAsHeader().withIgnoreHeaderCase().withTrim())) {

            for (CSVRecord csvRecord : csvParser) {
                try {
                    // Adapt to common CSV columns (Date, Description, Amount)
                    String dateStr = getColumn(csvRecord, "Date", "Time", "Timestamp");
                    String desc = getColumn(csvRecord, "Description", "Desc", "Memo", "Transaction");
                    String amountStr = getColumn(csvRecord, "Amount", "Value", "Cost");

                    if (dateStr != null && desc != null && amountStr != null) {
                        LocalDate date = parseDate(dateStr);
                        double amount = Double.parseDouble(amountStr.replace("$", "").replace(",", ""));
                        String category = categorize(desc);

                        transactions.add(new Transaction(date, desc, amount, category));
                    }
                } catch (Exception e) {
                    logger.warn("Skipping invalid row: {}", csvRecord, e);
                }
            }
        }
        return transactions;
    }

    public Map<String, Double> calculateCategoryTotals(List<Transaction> transactions) {
        Map<String, Double> totals = new HashMap<>();
        for (Transaction t : transactions) {
            totals.merge(t.category(), t.amount(), Double::sum);
        }
        return totals;
    }

    // Feature: Subscription Hunter
    public List<String> detectSubscriptions(List<Transaction> transactions) {
        Map<String, List<LocalDate>> recurrenceMap = new HashMap<>();

        // Group by description (simple exact match for now, could be fuzzy)
        for (Transaction t : transactions) {
            if (t.amount() < 0) { // Only expenses
                recurrenceMap.computeIfAbsent(t.description(), k -> new ArrayList<>()).add(t.date());
            }
        }

        List<String> validSubscriptions = new ArrayList<>();

        for (Map.Entry<String, List<LocalDate>> entry : recurrenceMap.entrySet()) {
            List<LocalDate> dates = entry.getValue();
            if (dates.size() >= 2) {
                // Check if roughly monthly (25-35 days apart)
                dates.sort(LocalDate::compareTo);
                boolean isMonthly = true;
                for (int i = 0; i < dates.size() - 1; i++) {
                    long days = java.time.temporal.ChronoUnit.DAYS.between(dates.get(i), dates.get(i + 1));
                    if (days < 25 || days > 35) {
                        isMonthly = false;
                        break;
                    }
                }
                if (isMonthly) {
                    validSubscriptions.add(entry.getKey() + " (Seen " + dates.size() + " times)");
                }
            }
        }
        return validSubscriptions;
    }

    // Feature: Forecasting
    // Returns estimated days remaining
    public int forecastRunway(double currentBalance, List<Transaction> transactions) {
        if (transactions.isEmpty())
            return 0;

        // simple average daily spend
        double totalSpend = transactions.stream()
                .filter(t -> t.amount() < 0)
                .mapToDouble(Transaction::amount)
                .sum(); // this is negative

        double absTotalSpend = Math.abs(totalSpend);

        LocalDate minDate = transactions.stream().map(Transaction::date).min(LocalDate::compareTo)
                .orElse(LocalDate.now());
        LocalDate maxDate = transactions.stream().map(Transaction::date).max(LocalDate::compareTo)
                .orElse(LocalDate.now());

        long daysRange = java.time.temporal.ChronoUnit.DAYS.between(minDate, maxDate);
        if (daysRange == 0)
            daysRange = 1;

        double dailyBurn = absTotalSpend / daysRange;

        if (dailyBurn == 0)
            return 9999;

        return (int) (currentBalance / dailyBurn);
    }

    private String getColumn(CSVRecord record, String... possibleNames) {
        for (String name : possibleNames) {
            if (record.isMapped(name)) {
                return record.get(name);
            }
        }
        return null;
    }

    private String categorize(String description) {
        String lowerDesc = description.toLowerCase(Locale.ROOT);
        for (Map.Entry<String, List<String>> entry : categoryRules.entrySet()) {
            for (String keyword : entry.getValue()) {
                if (lowerDesc.contains(keyword)) {
                    return entry.getKey();
                }
            }
        }
        return "Uncategorized";
    }

    private LocalDate parseDate(String dateStr) {
        try {
            return LocalDate.parse(dateStr, DateTimeFormatter.ISO_DATE);
        } catch (Exception e) {
            try {
                return LocalDate.parse(dateStr, DateTimeFormatter.ofPattern("MM/dd/yyyy"));
            } catch (Exception ex) {
                return LocalDate.now();
            }
        }
    }
}
