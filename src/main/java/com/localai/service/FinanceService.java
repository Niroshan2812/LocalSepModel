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

    // Lite Task: Deterministic Categorization Rules
    private static final Map<String, String[]> CATEGORY_RULES = new HashMap<>();

    static {
        CATEGORY_RULES.put("Food", new String[] { "restaurant", "cafe", "coffee", "burger", "pizza", "kfc", "mcdonalds",
                "grocery", "supermarket" });
        CATEGORY_RULES.put("Transport",
                new String[] { "uber", "lyft", "taxi", "bus", "train", "fuel", "gas", "shell", "parking" });
        CATEGORY_RULES.put("Utilities",
                new String[] { "electric", "water", "internet", "phone", "mobile", "utility", "bill" });
        CATEGORY_RULES.put("Shopping", new String[] { "amazon", "walmart", "target", "clothing", "shoe", "store" });
        CATEGORY_RULES.put("Entertainment", new String[] { "netflix", "spotify", "movie", "cinema", "game", "steam" });
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

    private String getColumn(CSVRecord record, String... possibleNames) {
        for (String name : possibleNames) {
            if (record.isMapped(name)) {
                return record.get(name);
            }
        }
        // Fallback: try by index if headers are missing? For now return null.
        return null;
    }

    private String categorize(String description) {
        String lowerDesc = description.toLowerCase(Locale.ROOT);
        for (Map.Entry<String, String[]> entry : CATEGORY_RULES.entrySet()) {
            for (String keyword : entry.getValue()) {
                if (lowerDesc.contains(keyword)) {
                    return entry.getKey();
                }
            }
        }
        return "Uncategorized";
    }

    private LocalDate parseDate(String dateStr) {
        // Simple parser, can be expanded for more formats
        try {
            return LocalDate.parse(dateStr, DateTimeFormatter.ISO_DATE); // yyyy-MM-dd
        } catch (Exception e) {
            try {
                // Try standard US format MM/dd/yyyy
                return LocalDate.parse(dateStr, DateTimeFormatter.ofPattern("MM/dd/yyyy"));
            } catch (Exception ex) {
                return LocalDate.now(); // Fallback
            }
        }
    }
}
