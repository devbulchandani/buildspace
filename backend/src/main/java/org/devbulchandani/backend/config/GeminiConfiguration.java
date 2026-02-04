package org.devbulchandani.backend.config;

import dev.langchain4j.model.chat.ChatModel;
import dev.langchain4j.model.googleai.GeminiThinkingConfig;
import dev.langchain4j.model.googleai.GoogleAiGeminiChatModel;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GeminiConfiguration {

    @Bean
    public ChatModel gemini(){
        return GoogleAiGeminiChatModel.builder()
                .apiKey(System.getenv("GEMINI_API_KEY"))
                .modelName("gemini-3-pro-preview")
                .thinkingConfig(GeminiThinkingConfig.builder()
                        .thinkingLevel(GeminiThinkingConfig.GeminiThinkingLevel.LOW) // or HIGH
                        .build())
                .sendThinking(true)
                .returnThinking(true)
                .build();
    }
}
