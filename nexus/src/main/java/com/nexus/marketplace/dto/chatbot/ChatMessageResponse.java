package com.nexus.marketplace.dto.chatbot;

import com.nexus.marketplace.dto.game.GameDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageResponse {
    private String response;
    private List<GameDTO> games;
}


