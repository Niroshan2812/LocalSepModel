package com.localai.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.document.Document;
import org.springframework.ai.reader.pdf.PagePdfDocumentReader;
import org.springframework.ai.transformer.splitter.TokenTextSplitter;
import org.springframework.ai.vectorstore.SimpleVectorStore;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDDocumentInformation;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class DocumentService {

    private static final Logger logger = LoggerFactory.getLogger(DocumentService.class);
    private final SimpleVectorStore vectorStore;
    private final ProcessingStatusService statusService;

    public DocumentService(SimpleVectorStore vectorStore, ProcessingStatusService statusService) {
        this.vectorStore = vectorStore;
        this.statusService = statusService;
    }

    public String initProcess(MultipartFile file) throws IOException {
        String jobId = statusService.createJob();

        // Save to temp file strictly for the async process to pick up
        Path tempFile = Files.createTempFile("upload-", file.getOriginalFilename());
        file.transferTo(tempFile.toFile());

        // Trigger Async
        processInBackground(jobId, tempFile.toFile(), file.getOriginalFilename());

        return jobId;
    }

    @org.springframework.scheduling.annotation.Async
    public void processInBackground(String jobId, File tempFile, String originalFilename) {
        statusService.updateStatus(jobId, "PROCESSING", "Starting ingestion for " + originalFilename);

        try {
            logger.info("Processing PDF Async: {}", originalFilename);
            Map<String, Object> metadata = new HashMap<>();

            Resource pdfResource = new FileSystemResource(tempFile);

            // 1. Read PDF
            statusService.updateStatus(jobId, "PROCESSING", "reading_pdf");
            PagePdfDocumentReader pdfReader = new PagePdfDocumentReader(pdfResource);
            List<Document> documents = pdfReader.get();
            logger.info("Extracted {} pages/documents from PDF.", documents.size());

            // Collect full text - Optional/Lite logic
            StringBuilder fullText = new StringBuilder();
            for (Document doc : documents) {
                fullText.append(doc.getContent()).append("\n\n");
            }
            metadata.put("extracted_text", fullText.toString());
            metadata.put("filename", originalFilename);
            metadata.put("page_count", documents.size());

            // 3. Split into tokens
            statusService.updateStatus(jobId, "PROCESSING", "splitting_text");
            TokenTextSplitter splitter = new TokenTextSplitter();
            List<Document> chunks = splitter.apply(documents);
            logger.info("Split into {} chunks.", chunks.size());

            // 4. Add to Vector Store
            statusService.updateStatus(jobId, "PROCESSING", "embedding_chunks");
            vectorStore.add(chunks);
            logger.info("Added chunks to Vector Store.");

            // 5. Persist
            File storeFile = new File("vectorstore.json");
            vectorStore.save(storeFile);
            logger.info("Vector store saved.");

            statusService.updateStatus(jobId, "COMPLETED", "Document ingested successfully", metadata);

        } catch (Exception e) {
            logger.error("Async Processing Failed", e);
            statusService.updateStatus(jobId, "ERROR", e.getMessage());
        } finally {
            // Cleanup
            try {
                Files.deleteIfExists(tempFile.toPath());
            } catch (IOException ignored) {
            }
        }
    }

    public void clearStore() {
        try {
            File storeFile = new File("vectorstore.json");

            // 1. Delete existing file
            if (storeFile.exists()) {
                if (storeFile.delete()) {
                    logger.info("Vector Store persistence file deleted (Nuked).");
                } else {
                    logger.error("Failed to delete Vector Store file.");
                }
            }

            // 2. Clear In-Memory Store
            // SimpleVectorStore loads from file. If we load an empty file, it might clear
            // it?
            // Or we just rely on restarting. Ideally we want runtime clearing.
            // Since SimpleVectorStore.load() typically replaces or adds, we need to be
            // careful.
            // If it adds, we are stuck. But assuming standard serialization
            // deserialization...

            // Workaround: We cannot easily access the internal map to clear it without
            // reflection
            // or an API update.
            // BEST EFFORT: Create a valid empty JSON file and load it.
            // Spring AI SimpleVectorStore expects a JSON map or list.
            // Let's try writing an empty map JSON.

            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            mapper.writeValue(storeFile, new java.util.HashMap<>()); // write {}

            // 3. Reload from the empty file
            vectorStore.load(storeFile);

            logger.info("Vector Store in-memory state reset (attempted).");

        } catch (Exception e) {
            logger.error("Error clearing vector store", e);
        }
    }
}
