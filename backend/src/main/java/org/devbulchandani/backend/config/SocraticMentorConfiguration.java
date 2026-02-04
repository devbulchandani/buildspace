package org.devbulchandani.backend.config;

import dev.langchain4j.mcp.McpToolProvider;
import dev.langchain4j.model.chat.ChatModel;
import dev.langchain4j.service.AiServices;
import org.devbulchandani.backend.dtos.MentorBot;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SocraticMentorConfiguration {
    @Bean
    public MentorBot mentorBot(
            ChatModel gemini,
            McpToolProvider repoToolProvider) {

        return AiServices.builder(MentorBot.class)
                .chatModel(gemini)
                .toolProvider(repoToolProvider)
                .build();
    }

}
