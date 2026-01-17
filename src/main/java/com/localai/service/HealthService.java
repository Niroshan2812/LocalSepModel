package com.localai.service;

import com.localai.model.JournalEntry;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class HealthService {

    private static final Logger logger = LoggerFactory.getLogger(HealthService.class);
    private final EncryptionService encryptionService;
    private final File journalFile = new File("journal_store.json");
    private final ObjectMapper mapper;

    public HealthService(EncryptionService encryptionService) {
        this.encryptionService = encryptionService;
        this.mapper = new ObjectMapper();
        this.mapper.registerModule(new JavaTimeModule());
    }

    public JournalEntry createEntry(String content, String password) throws Exception {
        String encrypted = encryptionService.encrypt(content, password);
        String mood = analyzeSentiment(content); // Lite Task

        JournalEntry entry = new JournalEntry(
                UUID.randomUUID().toString(),
                LocalDateTime.now(),
                encrypted,
                mood);

        saveEntry(entry);
        return entry;
    }

    public List<JournalEntry> getEntries(String password) throws IOException {
        // In a real scenario, we might verify password hash first.
        // Here, we just return the entries. Decryption happens on demand or we try to
        // decrypt all.
        // API will return a DTO with decrypted content if password works.

        List<JournalEntry> stored = loadEntries();
        return stored;
    }

    // Attempt to decrypt a list of entries. Failed decryptions (wrong password)
    // will throw or return error.
    public List<DecryptedEntry> decryptEntries(List<JournalEntry> entries, String password) {
        return entries.stream().map(e -> {
            try {
                String plain = encryptionService.decrypt(e.getEncryptedContent(), password);
                return new DecryptedEntry(e.getId(), e.getTimestamp(), plain, e.getMood());
            } catch (Exception ex) {
                // Wrong password or corrupt
                return null;
            }
        }).filter(java.util.Objects::nonNull).collect(Collectors.toList());
    }

    // Lite Task: Simple Heuristic Sentiment
    private String analyzeSentiment(String text) {
        String lower = text.toLowerCase();
        int positive = countMatches(lower, "good", "happy", "great", "excellent", "love", "hope", "calm");
        int negative = countMatches(lower, "bad", "sad", "angry", "hate", "anxious", "stress", "tired", "pain");

        if (positive > negative)
            return "Positive";
        if (negative > positive)
            return "Negative";
        return "Neutral";
    }

    private int countMatches(String text, String... words) {
        int count = 0;
        for (String word : words) {
            if (text.contains(word))
                count++;
        }
        return count;
    }

    private synchronized void saveEntry(JournalEntry entry) throws IOException {
        List<JournalEntry> entries = loadEntries();
        entries.add(entry);
        mapper.writeValue(journalFile, entries);
    }

    private synchronized List<JournalEntry> loadEntries() throws IOException {
        if (!journalFile.exists()) {
            return new ArrayList<>();
        }
        return new ArrayList<>(Arrays.asList(mapper.readValue(journalFile, JournalEntry[].class)));
    }

    // Helper DTO for UI
    public record DecryptedEntry(String id, LocalDateTime timestamp, String content, String mood) {
    }
}
