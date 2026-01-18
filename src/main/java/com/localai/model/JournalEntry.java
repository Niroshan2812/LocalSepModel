package com.localai.model;

import java.time.LocalDateTime;

// In a real app, this would be an @Entity. 
// For this local-first file-based demo, we'll serialize this to JSON/Files.
public class JournalEntry {
    private String id;
    private LocalDateTime timestamp;
    private String encryptedContent; // Stored encrypted
    private String mood; // "Positive", "Neutral", "Negative"
    private int sentimentScore; // 1-10

    public JournalEntry() {
    }

    public JournalEntry(String id, LocalDateTime timestamp, String encryptedContent, String mood, int sentimentScore) {
        this.id = id;
        this.timestamp = timestamp;
        this.encryptedContent = encryptedContent;
        this.mood = mood;
        this.sentimentScore = sentimentScore;
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

    public int getSentimentScore() {
        return sentimentScore;
    }

    public void setSentimentScore(int sentimentScore) {
        this.sentimentScore = sentimentScore;
    }
}
