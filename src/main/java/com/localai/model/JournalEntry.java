package com.localai.model;

import java.time.LocalDateTime;

// In a real app, this would be an @Entity. 
// For this local-first file-based demo, we'll serialize this to JSON/Files.
public class JournalEntry {
    private String id;
    private LocalDateTime timestamp;
    private String encryptedContent; // Stored encrypted
    private String mood; // "Positive", "Neutral", "Negative" (Lite Task result) - Stored plain for
                         // indexing? Or encrypted? Let's keep plain for Lite task demo.

    public JournalEntry() {
    }

    public JournalEntry(String id, LocalDateTime timestamp, String encryptedContent, String mood) {
        this.id = id;
        this.timestamp = timestamp;
        this.encryptedContent = encryptedContent;
        this.mood = mood;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public String getEncryptedContent() {
        return encryptedContent;
    }

    public void setEncryptedContent(String encryptedContent) {
        this.encryptedContent = encryptedContent;
    }

    public String getMood() {
        return mood;
    }

    public void setMood(String mood) {
        this.mood = mood;
    }
}
