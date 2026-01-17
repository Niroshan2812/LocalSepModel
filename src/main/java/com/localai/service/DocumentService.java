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

    public DocumentService(SimpleVectorStore vectorStore) {
        this.vectorStore = vectorStore;
    }

    public Map<String, Object> processAndVectorize(MultipartFile file) throws IOException {
        logger.info("Processing PDF: {}", file.getOriginalFilename());

        // 1. Save MultipartFile to a temporary file because PDFReader prefers Resources
        Path tempFile = Files.createTempFile("upload-", ".pdf");
        file.transferTo(tempFile.toFile());

        Map<String, Object> metadata = new HashMap<>();

        try {
            Resource pdfResource = new FileSystemResource(tempFile.toFile());

            // 1.5 Lite Task: Extract Metadata using PDFBox
            // Temporarily disabled for debugging compilation mismatch
            /*
             * try (PDDocument document = PDDocument.load(tempFile.toFile())) {
             * PDDocumentInformation info = document.getDocumentInformation();
             * metadata.put("page_count", document.getNumberOfPages());
             * metadata.put("title", info.getTitle() != null ? info.getTitle() :
             * "Unknown Title");
             * metadata.put("author", info.getAuthor() != null ? info.getAuthor() :
             * "Unknown Author");
             * metadata.put("filename", file.getOriginalFilename());
             * logger.info("Extracted Metadata: {}", metadata);
             * }
             */
            // Fallback metadata
            metadata.put("filename", file.getOriginalFilename());
            metadata.put("page_count", "Unknown");
            metadata.put("author", "Unknown");

            // 2. Read PDF for RAG (Pro Task)
            PagePdfDocumentReader pdfReader = new PagePdfDocumentReader(pdfResource);
            List<Document> documents = pdfReader.get();
            logger.info("Extracted {} pages/documents from PDF.", documents.size());

            // 3. Split into tokens (Chunks)
            TokenTextSplitter splitter = new TokenTextSplitter();
            List<Document> chunks = splitter.apply(documents);
            logger.info("Split into {} chunks.", chunks.size());

            // 4. Add to Vector Store
            vectorStore.add(chunks);
            logger.info("Added chunks to Vector Store.");

            // 5. Persist Vector Store to disk
            File storeFile = new File("vectorstore.json");
            vectorStore.save(storeFile);
            logger.info("Vector store saved to: {}", storeFile.getAbsolutePath());

            return metadata;

        } catch (Exception e) {
            logger.error("Failed to process PDF", e);
            throw new IOException("Error processing PDF", e);
        } finally {
            // Cleanup temp file
            Files.deleteIfExists(tempFile);
        }
    }
}
