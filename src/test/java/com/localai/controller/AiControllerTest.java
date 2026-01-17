package com.localai.controller;

import org.junit.jupiter.api.Test;
import org.springframework.ai.chat.ChatClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AiController.class)
public class AiControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ChatClient chatClient;

    @Test
    public void testChatEndpoint() throws Exception {
        when(chatClient.call(anyString())).thenReturn("I am a local AI.");

        String jsonInfo = "{\"message\": \"Hello\"}";

        mockMvc.perform(post("/api/chat")
                .contentType(MediaType.APPLICATION_JSON)
                .content(jsonInfo))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.response").value("I am a local AI."));
    }

    @Test
    public void testClassifyEndpoint() throws Exception {
        when(chatClient.call(anyString())).thenReturn("Food");

        String jsonInfo = "{\"text\": \"KFC Burger\"}";

        mockMvc.perform(post("/api/chat/classify")
                .contentType(MediaType.APPLICATION_JSON)
                .content(jsonInfo))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.category").value("Food"));
    }
}
