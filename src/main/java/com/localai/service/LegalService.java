package com.localai.service;

import org.springframework.stereotype.Service;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Service
public class LegalService {

    // Regex patterns for PII
    private static final Pattern SSN_PATTERN = Pattern.compile("\\b\\d{3}-\\d{2}-\\d{4}\\b");
    private static final Pattern EMAIL_PATTERN = Pattern.compile("\\b[\\w.%-]+@[\\w.-]+\\.[a-zA-Z]{2,6}\\b");
    private static final Pattern PHONE_PATTERN = Pattern.compile("\\b\\(?\\d{3}\\)?[-.\\s]?\\d{3}[-.\\s]?\\d{4}\\b");

    public Map<String, Object> sanitizeDocument(String text) {
        String redacted = text;
        List<String> foundTypes = new ArrayList<>();

        Matcher ssnMatcher = SSN_PATTERN.matcher(redacted);
        if (ssnMatcher.find()) {
            redacted = ssnMatcher.replaceAll("[REDACTED-SSN]");
            foundTypes.add("SSN");
        }

        Matcher emailMatcher = EMAIL_PATTERN.matcher(redacted);
        if (emailMatcher.find()) {
            redacted = emailMatcher.replaceAll("[REDACTED-EMAIL]");
            foundTypes.add("Email");
        }

        Matcher phoneMatcher = PHONE_PATTERN.matcher(redacted);
        if (phoneMatcher.find()) {
            redacted = phoneMatcher.replaceAll("[REDACTED-PHONE]");
            foundTypes.add("Phone");
        }

        return Map.of("redactedText", redacted, "foundTypes", foundTypes);
    }

    public String prepareRiskAnalysisPrompt(String text) {
        // Truncate if too long for Lite model (approx check)
        String snippet = text.length() > 10000 ? text.substring(0, 10000) + "...(truncated)" : text;
        return "Explain the following legal text like I am 5 years old. Focus on the biggest RISKS, TRAPS, or MONEY I might lose. Be brutal but simple.\n\nText:\n"
                + snippet;
    }

    public String prepareFormFillPrompt(String profileJson, String formText) {
        String snippet = formText.length() > 5000 ? formText.substring(0, 5000) : formText;
        return "You are a Form Filler Agent. I have a user profile and a form.\n" +
                "User Profile: " + profileJson + "\n" +
                "Form Content: " + snippet + "\n\n" +
                "Task: List the fields in the form and the value from the profile that fits. If missing, say [MISSING]. Format as 'Field Name: Value'.";
    }
}
