package com.localai.config;

import org.springframework.ai.vectorstore.SimpleVectorStore;
import org.springframework.ai.embedding.EmbeddingClient;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;

import java.io.File;

@Configuration
public class VectorStoreConfig {

    @Bean
    public SimpleVectorStore simpleVectorStore(EmbeddingClient embeddingClient) {
        SimpleVectorStore simpleVectorStore = new SimpleVectorStore(embeddingClient);

        // Define where the vector store will be saved.
        // For a local app, a fixed location or relative to run dir is fine.
        File vectorStoreFile = new File("vectorstore.json");

        if (vectorStoreFile.exists()) {
            simpleVectorStore.load(vectorStoreFile);
        }

        return simpleVectorStore;
    }
}
