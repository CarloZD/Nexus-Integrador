package com.nexus.marketplace.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class SteamService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    private static final String STEAM_APP_LIST_URL = "https://api.steampowered.com/ISteamApps/GetAppList/v2/";
    private static final String STEAM_APP_DETAILS_URL = "https://store.steampowered.com/api/appdetails?appids=";

    public SteamService() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    public List<Map<String, Object>> getPopularGames() {
        // Lista de AppIDs populares de Steam para empezar
        String[] popularAppIds = {
                "730",    // Counter-Strike 2
                "570",    // Dota 2
                "1203220", // Naraka: Bladepoint
                "578080",  // PUBG
                "1172470", // Apex Legends
                "1240440", // Halo Infinite
                "1938090", // Call of Duty
                "2357570", // Tekken 8
                "489830",  // The Elder Scrolls Online
                "2519060"  // Helldivers 2
        };

        List<Map<String, Object>> games = new ArrayList<>();

        for (String appId : popularAppIds) {
            try {
                Map<String, Object> gameData = getGameDetails(appId);
                if (gameData != null) {
                    games.add(gameData);
                }
                // Pausa para evitar rate limiting
                Thread.sleep(1500);
            } catch (Exception e) {
                System.err.println("Error fetching game " + appId + ": " + e.getMessage());
            }
        }

        return games;
    }

    public Map<String, Object> getGameDetails(String appId) {
        try {
            String url = STEAM_APP_DETAILS_URL + appId;
            String response = restTemplate.getForObject(url, String.class);

            JsonNode root = objectMapper.readTree(response);
            JsonNode gameNode = root.get(appId);

            if (gameNode == null || !gameNode.get("success").asBoolean()) {
                return null;
            }

            JsonNode data = gameNode.get("data");

            // Extraer información relevante
            Map<String, Object> gameData = new java.util.HashMap<>();
            gameData.put("steamAppId", appId);
            gameData.put("title", data.get("name").asText());
            gameData.put("shortDescription", data.has("short_description") ?
                    data.get("short_description").asText() : "");
            gameData.put("description", data.has("detailed_description") ?
                    data.get("detailed_description").asText() : "");
            gameData.put("headerImage", data.has("header_image") ?
                    data.get("header_image").asText() : "");
            gameData.put("backgroundImage", data.has("background") ?
                    data.get("background").asText() : "");

            // Precio
            if (data.has("is_free") && data.get("is_free").asBoolean()) {
                gameData.put("isFree", true);
                gameData.put("price", BigDecimal.ZERO);
            } else if (data.has("price_overview")) {
                JsonNode priceNode = data.get("price_overview");
                double price = priceNode.get("final").asDouble() / 100.0;
                gameData.put("price", BigDecimal.valueOf(price));
                gameData.put("isFree", false);
            } else {
                gameData.put("price", BigDecimal.valueOf(59.99));
                gameData.put("isFree", false);
            }

            // Desarrolladores y publicadores
            if (data.has("developers") && data.get("developers").isArray()) {
                gameData.put("developer", data.get("developers").get(0).asText());
            }
            if (data.has("publishers") && data.get("publishers").isArray()) {
                gameData.put("publisher", data.get("publishers").get(0).asText());
            }

            // Fecha de lanzamiento
            if (data.has("release_date")) {
                gameData.put("releaseDate", data.get("release_date").get("date").asText());
            }

            // Géneros
            if (data.has("genres") && data.get("genres").isArray()) {
                StringBuilder genres = new StringBuilder();
                data.get("genres").forEach(genre -> {
                    if (genres.length() > 0) genres.append(", ");
                    genres.append(genre.get("description").asText());
                });
                gameData.put("genres", genres.toString());
            }

            // Categorías
            if (data.has("categories") && data.get("categories").isArray()) {
                StringBuilder categories = new StringBuilder();
                data.get("categories").forEach(cat -> {
                    if (categories.length() > 0) categories.append(", ");
                    categories.append(cat.get("description").asText());
                });
                gameData.put("categories", categories.toString());
            }

            return gameData;

        } catch (Exception e) {
            System.err.println("Error getting game details for " + appId + ": " + e.getMessage());
            return null;
        }
    }
}