package com.nexus.marketplace.service;

import com.nexus.marketplace.domain.Game;
import com.nexus.marketplace.dto.chatbot.ChatMessageResponse;
import com.nexus.marketplace.dto.game.GameDTO;
import com.nexus.marketplace.repository.GameRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class ChatbotService {

    private static final Logger logger = LoggerFactory.getLogger(ChatbotService.class);

    @Autowired
    private GroqAIService groqAIService;

    @Autowired
    private GameRepository gameRepository;

    @Autowired
    private GameService gameService;

    public ChatMessageResponse processMessage(String userMessage) {
        logger.info("💬 Procesando mensaje del usuario: {}", userMessage);

        try {
            // Obtener juegos relevantes basados en el mensaje
            List<Game> relevantGames = filterRelevantGames(userMessage);
            logger.debug("🎮 Juegos relevantes encontrados: {}", relevantGames.size());

            // Construir contexto de juegos
            String gameContext = buildGameContext(relevantGames);

            // Generar respuesta de la IA
            String systemPrompt = groqAIService.buildSystemPrompt();
            String aiResponse = groqAIService.generateResponse(systemPrompt, userMessage, gameContext);

            // Convertir juegos a DTOs
            List<GameDTO> gameDTOs = relevantGames.stream()
                    .map(game -> convertGameToDTO(game))
                    .collect(Collectors.toList());

            logger.info("✅ Mensaje procesado exitosamente");

            return ChatMessageResponse.builder()
                    .response(aiResponse)
                    .games(gameDTOs)
                    .build();

        } catch (Exception e) {
            logger.error("❌ Error al procesar mensaje: {}", e.getMessage(), e);
            return ChatMessageResponse.builder()
                    .response("Lo siento, ocurrió un error al procesar tu mensaje. Por favor, intenta de nuevo.")
                    .games(Collections.emptyList())
                    .build();
        }
    }

    private List<Game> filterRelevantGames(String userMessage) {
        String messageLower = userMessage.toLowerCase();
        List<Game> allActiveGames = gameRepository.findByActiveTrue();

        if (allActiveGames.isEmpty()) {
            logger.warn("⚠️ No hay juegos activos en la base de datos");
            return Collections.emptyList();
        }

        // Mapa de palabras clave a categorías
        Map<String, Game.GameCategory> keywordToCategory = new HashMap<>();
        keywordToCategory.put("acción", Game.GameCategory.ACTION);
        keywordToCategory.put("action", Game.GameCategory.ACTION);
        keywordToCategory.put("aventura", Game.GameCategory.ADVENTURE);
        keywordToCategory.put("adventure", Game.GameCategory.ADVENTURE);
        keywordToCategory.put("rpg", Game.GameCategory.RPG);
        keywordToCategory.put("rol", Game.GameCategory.RPG);
        keywordToCategory.put("estrategia", Game.GameCategory.STRATEGY);
        keywordToCategory.put("strategy", Game.GameCategory.STRATEGY);
        keywordToCategory.put("deportes", Game.GameCategory.SPORTS);
        keywordToCategory.put("sports", Game.GameCategory.SPORTS);
        keywordToCategory.put("simulación", Game.GameCategory.SIMULATION);
        keywordToCategory.put("simulation", Game.GameCategory.SIMULATION);
        keywordToCategory.put("carreras", Game.GameCategory.RACING);
        keywordToCategory.put("racing", Game.GameCategory.RACING);
        keywordToCategory.put("puzzle", Game.GameCategory.PUZZLE);
        keywordToCategory.put("rompecabezas", Game.GameCategory.PUZZLE);
        keywordToCategory.put("terror", Game.GameCategory.HORROR);
        keywordToCategory.put("horror", Game.GameCategory.HORROR);
        keywordToCategory.put("suspenso", Game.GameCategory.HORROR);
        keywordToCategory.put("miedo", Game.GameCategory.HORROR);
        keywordToCategory.put("indie", Game.GameCategory.INDIE);

        // Buscar categoría por palabra clave
        Game.GameCategory targetCategory = null;
        for (Map.Entry<String, Game.GameCategory> entry : keywordToCategory.entrySet()) {
            if (messageLower.contains(entry.getKey())) {
                targetCategory = entry.getValue();
                break;
            }
        }

        // Lista de juegos con puntuación
        List<GameScore> scoredGames = new ArrayList<>();

        for (Game game : allActiveGames) {
            int score = 0;

            // Puntuación por categoría
            if (targetCategory != null && game.getCategory() == targetCategory) {
                score += 10;
            }

            // Puntuación por título
            if (game.getTitle() != null && messageLower.contains(game.getTitle().toLowerCase())) {
                score += 20;
            }

            // Puntuación por descripción
            if (game.getDescription() != null) {
                String descLower = game.getDescription().toLowerCase();
                String[] words = messageLower.split("\\s+");
                for (String word : words) {
                    if (word.length() > 3 && descLower.contains(word)) {
                        score += 2;
                    }
                }
            }

            // Puntuación por género
            if (game.getGenres() != null) {
                String genresLower = game.getGenres().toLowerCase();
                String[] words = messageLower.split("\\s+");
                for (String word : words) {
                    if (word.length() > 3 && genresLower.contains(word)) {
                        score += 3;
                    }
                }
            }

            // Puntuación por desarrollador
            if (game.getDeveloper() != null && messageLower.contains(game.getDeveloper().toLowerCase())) {
                score += 5;
            }

            if (score > 0) {
                scoredGames.add(new GameScore(game, score));
            }
        }

        // Ordenar por puntuación descendente
        scoredGames.sort((a, b) -> Integer.compare(b.score, a.score));

        // Obtener los mejores juegos (máximo 5)
        List<Game> relevantGames = scoredGames.stream()
                .limit(5)
                .map(gs -> gs.game)
                .collect(Collectors.toList());

        // Si no hay juegos relevantes, devolver juegos aleatorios
        if (relevantGames.isEmpty()) {
            logger.debug("🎲 No se encontraron juegos relevantes, devolviendo juegos aleatorios");
            Collections.shuffle(allActiveGames);
            return allActiveGames.stream()
                    .limit(3)
                    .collect(Collectors.toList());
        }

        return relevantGames;
    }

    private String buildGameContext(List<Game> games) {
        if (games.isEmpty()) {
            return "No hay juegos específicos disponibles en este momento.";
        }

        StringBuilder context = new StringBuilder();
        context.append("Aquí tienes algunos juegos relevantes que podrías mencionar:\n\n");

        for (int i = 0; i < games.size(); i++) {
            Game game = games.get(i);
            context.append(String.format("%d. %s", i + 1, game.getTitle()));
            
            if (game.getPrice() != null) {
                context.append(String.format(" - Precio: S/. %s", game.getPrice()));
            }
            
            if (game.getCategory() != null) {
                context.append(String.format(" - Categoría: %s", game.getCategory()));
            }
            
            if (game.getShortDescription() != null && !game.getShortDescription().isEmpty()) {
                context.append(String.format("\n   Descripción: %s", 
                    game.getShortDescription().length() > 100 
                        ? game.getShortDescription().substring(0, 100) + "..." 
                        : game.getShortDescription()));
            }
            
            context.append("\n\n");
        }

        return context.toString();
    }

    private GameDTO convertGameToDTO(Game game) {
        return GameDTO.builder()
                .id(game.getId())
                .steamAppId(game.getSteamAppId())
                .title(game.getTitle())
                .description(game.getDescription())
                .shortDescription(game.getShortDescription())
                .price(game.getPrice())
                .category(game.getCategory() != null ? game.getCategory().name() : null)
                .platform(game.getPlatform() != null ? game.getPlatform().name() : null)
                .rating(game.getRating())
                .imageUrl(game.getImageUrl())
                .coverImageUrl(game.getCoverImageUrl())
                .featured(game.getFeatured())
                .screenshots(game.getScreenshots())
                .headerImage(game.getHeaderImage())
                .backgroundImage(game.getBackgroundImage())
                .developer(game.getDeveloper())
                .publisher(game.getPublisher())
                .releaseDate(game.getReleaseDate())
                .genres(game.getGenres())
                .categories(game.getCategories())
                .isFree(game.getIsFree())
                .stock(game.getStock())
                .active(game.getActive())
                .build();
    }

    // Clase interna para manejar puntuación de juegos
    private static class GameScore {
        Game game;
        int score;

        GameScore(Game game, int score) {
            this.game = game;
            this.score = score;
        }
    }
}

