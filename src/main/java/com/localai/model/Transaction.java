package com.localai.model;

import java.time.LocalDate;

public record Transaction(LocalDate date, String description, double amount, String category) {
}
