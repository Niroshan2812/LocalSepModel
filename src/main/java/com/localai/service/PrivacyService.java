package com.localai.service;

import org.springframework.stereotype.Service;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class PrivacyService {

    // Regex Patterns
    private static final String EMAIL_PATTERN = "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,6}";
    private static final String PHONE_PATTERN = "\\b\\d{3}[-.]?\\d{3}[-.]?\\d{4}\\b";
    private static final String SSN_PATTERN = "\\b\\d{3}-\\d{2}-\\d{4}\\b";
    // Basic date pattern (MM/DD/YYYY or YYYY-MM-DD)
    private static final String DATE_PATTERN = "\\b(?:\\d{4}-\\d{2}-\\d{2}|\\d{2}/\\d{2}/\\d{4})\\b";
    // Basic amount pattern ($100, $50.00)
    private static final String MONEY_PATTERN = "\\$\\d+(?:,\\d{3})*(?:\\.\\d{2})?";

    public String redact(String text, String level) {
        if (text == null || level == null || "none".equalsIgnoreCase(level) || "low".equalsIgnoreCase(level)) {
            return text;
        }

        String redacted = text;

        // Medium: Redact SSN, Email, Phone
        if ("medium".equalsIgnoreCase(level) || "high".equalsIgnoreCase(level)) {
            redacted = redacted.replaceAll(SSN_PATTERN, "[REDACTED-SSN]");
            redacted = redacted.replaceAll(EMAIL_PATTERN, "[REDACTED-EMAIL]");
            redacted = redacted.replaceAll(PHONE_PATTERN, "[REDACTED-PHONE]");
        }

        // High: Redact Dates, Money, and maybe specific named entities if we had NLP
        // (regex for now)
        if ("high".equalsIgnoreCase(level)) {
            redacted = redacted.replaceAll(DATE_PATTERN, "[REDACTED-DATE]");
            redacted = redacted.replaceAll(MONEY_PATTERN, "[REDACTED-AMOUNT]");
        }

        return redacted;
    }
}
