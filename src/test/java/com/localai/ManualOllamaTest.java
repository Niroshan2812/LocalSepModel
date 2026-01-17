package com.localai;

import org.junit.jupiter.api.Test;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Scanner;

public class ManualOllamaTest {

    @Test
    public void testOllamaConnectivity() {
        String urlString = "http://localhost:11434/api/tags";
        System.out.println("\n---------------------------------------------------");
        System.out.println("Checking Ollama Connectivity at: " + urlString);
        System.out.println("---------------------------------------------------");

        try {
            URL url = new URL(urlString);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");
            conn.setConnectTimeout(2000);
            conn.setReadTimeout(2000);

            int code = conn.getResponseCode();
            System.out.println("Response Code: " + code);

            if (code == 200) {
                System.out.println("SUCCESS: Ollama is running!");
                System.out.println("Available Models:");
                try (Scanner s = new Scanner(conn.getInputStream()).useDelimiter("\\A")) {
                    System.out.println(s.hasNext() ? s.next() : "");
                }
            } else {
                System.out.println("FAILURE: Status code " + code);
            }
        } catch (Exception e) {
            System.out.println("FAILURE: Could not connect to Ollama.");
            System.out.println("Error: " + e.getMessage());
            System.out.println("Ensure 'ollama serve' is running or checks your firewall.");
        }
        System.out.println("---------------------------------------------------\n");
    }
}
