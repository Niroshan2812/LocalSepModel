package com.localai.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.io.RandomAccessFile;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Duration;

@Service
public class DownloaderService {

    private static final Logger logger = LoggerFactory.getLogger(DownloaderService.class);
    private final HttpClient httpClient;

    public DownloaderService() {
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .followRedirects(HttpClient.Redirect.NORMAL)
                .build();
    }

    public void downloadFile(String fileUrl, String destinationPath) {
        Path targetPath = Paths.get(destinationPath);
        long existingSize = 0;

        if (Files.exists(targetPath)) {
            try {
                existingSize = Files.size(targetPath);
                logger.info("Found existing partial file. Size: {} bytes. Resuming...", existingSize);
            } catch (IOException e) {
                logger.error("Error reading existing file size", e);
            }
        } else {
            // Ensure parent directories exist
            try {
                Files.createDirectories(targetPath.getParent());
            } catch (IOException e) {
                logger.error("Error creating directories", e);
                return;
            }
        }

        HttpRequest.Builder requestBuilder = HttpRequest.newBuilder()
                .uri(URI.create(fileUrl))
                .GET();

        if (existingSize > 0) {
            requestBuilder.header("Range", "bytes=" + existingSize + "-");
        }

        HttpRequest request = requestBuilder.build();

        try {
            HttpResponse<InputStream> response = httpClient.send(request, HttpResponse.BodyHandlers.ofInputStream());

            int statusCode = response.statusCode();
            if (statusCode == 206) {
                logger.info("Server supports resume. Downloading rest of content...");
                appendToFile(targetPath, response.body());
            } else if (statusCode == 200) {
                if (existingSize > 0) {
                    logger.warn("Server does not support resume (Range). Overwriting file started from scratch.");
                }
                saveToFile(targetPath, response.body()); // Full download
            } else if (statusCode == 416) {
                logger.info("Download already complete (Range Not Satisfiable).");
            } else {
                logger.error("Download failed with status code: {}", statusCode);
            }

        } catch (IOException | InterruptedException e) {
            logger.error("Download interrupted or failed", e);
            Thread.currentThread().interrupt();
        }
    }

    private void appendToFile(Path path, InputStream inputStream) throws IOException {
        try (RandomAccessFile raf = new RandomAccessFile(path.toFile(), "rw")) {
            raf.seek(raf.length()); // Move to end
            byte[] buffer = new byte[8192];
            int bytesRead;
            long totalRead = 0;
            while ((bytesRead = inputStream.read(buffer)) != -1) {
                raf.write(buffer, 0, bytesRead);
                totalRead += bytesRead;
                if (totalRead % (1024 * 1024 * 10) == 0) { // Log every 10MB
                    System.out.print(".");
                }
            }
            logger.info("\nDownload finished. Appended {} bytes.", totalRead);
        }
    }

    private void saveToFile(Path path, InputStream inputStream) throws IOException {
        try (RandomAccessFile raf = new RandomAccessFile(path.toFile(), "rw")) {
            raf.setLength(0); // Truncate if exists
            byte[] buffer = new byte[8192];
            int bytesRead;
            long totalRead = 0;
            while ((bytesRead = inputStream.read(buffer)) != -1) {
                raf.write(buffer, 0, bytesRead);
                totalRead += bytesRead;
                if (totalRead % (1024 * 1024 * 10) == 0) {
                    System.out.print(".");
                }
            }
            logger.info("\nDownload finished. Total size: {} bytes.", totalRead);
        }
    }
}
