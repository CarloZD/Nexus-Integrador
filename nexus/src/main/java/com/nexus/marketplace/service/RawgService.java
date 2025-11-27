package com.nexus.marketplace.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Random;


@Service
public class RawgService {

    @Autowired
    private RestTemplate restTemplate;

    private final ObjectMapper objectMapper;
    private final Random random;

    // Obtén tu API key gratis en: https://rawg.io/api
    // O usa esta temporal (límite de 20,000 requests/mes)
    private static final String API_KEY = "8350ea33ef5f40e991422dcc33d463a3";
    private static final String BASE_URL = "https://api.rawg.io/api";

    public RawgService() {
        this.objectMapper = new ObjectMapper();
        this.random = new Random();
    }

    public List<Map<String, Object>> getPopularGames() {
        List<Map<String, Object>> games = new ArrayList<>();

        try {
            // Obtener juegos populares con metacritic > 80
            String url = BASE_URL + "/games?key=" + API_KEY +
                    "&page_size=20&metacritic=80,100&ordering=-rating";

            String response = restTemplate.getForObject(url, String.class);
            JsonNode root = objectMapper.readTree(response);
            JsonNode results = root.get("results");

            if (results != null && results.isArray()) {
                for (JsonNode gameNode : results) {
                    Map<String, Object> gameData = extractGameData(gameNode);
                    if (gameData != null) {
                        games.add(gameData);
                    }
                }
            }

        } catch (Exception e) {
            System.err.println("Error fetching games from RAWG: " + e.getMessage());
        }

        return games;
    }

    public Map<String, Object> getGameDetails(String gameSlug) {
        try {
            String url = BASE_URL + "/games/" + gameSlug + "?key=" + API_KEY;
            String response = restTemplate.getForObject(url, String.class);
            JsonNode gameNode = objectMapper.readTree(response);

            return extractGameData(gameNode);

        } catch (Exception e) {
            System.err.println("Error getting game details from RAWG: " + e.getMessage());
            return null;
        }
    }

    private Map<String, Object> extractGameData(JsonNode data) {
        try {
            Map<String, Object> gameData = new java.util.HashMap<>();

            // ID (usar slug como identificador único)
            String slug = data.get("slug").asText();
            gameData.put("steamAppId", slug);

            // Título
            gameData.put("title", data.get("name").asText());

            // Descripción
            if (data.has("description_raw")) {
                String description = data.get("description_raw").asText();
                gameData.put("description", description);
                // Tomar primeros 200 caracteres para short description
                gameData.put("shortDescription",
                        description.length() > 200 ? description.substring(0, 200) + "..." : description);
            }

            // Imágenes
            if (data.has("background_image")) {
                String image = data.get("background_image").asText();
                gameData.put("headerImage", image);
                gameData.put("backgroundImage", image);
            }

            // Precio (generar precio aleatorio basado en rating)
            double rating = data.has("rating") ? data.get("rating").asDouble() : 3.5;
            double basePrice = 19.99 + (rating * 10);
            BigDecimal price = BigDecimal.valueOf(Math.round(basePrice * 100.0) / 100.0);
            gameData.put("price", price);
            gameData.put("isFree", false);

            // Desarrolladores
            if (data.has("developers") && data.get("developers").isArray() &&
                    data.get("developers").size() > 0) {
                gameData.put("developer", data.get("developers").get(0).get("name").asText());
            }

            // Publishers
            if (data.has("publishers") && data.get("publishers").isArray() &&
                    data.get("publishers").size() > 0) {
                gameData.put("publisher", data.get("publishers").get(0).get("name").asText());
            }

            // Fecha de lanzamiento
            if (data.has("released")) {
                gameData.put("releaseDate", data.get("released").asText());
            }

            // Géneros
            if (data.has("genres") && data.get("genres").isArray()) {
                StringBuilder genres = new StringBuilder();
                data.get("genres").forEach(genre -> {
                    if (genres.length() > 0) genres.append(", ");
                    genres.append(genre.get("name").asText());
                });
                gameData.put("genres", genres.toString());
            }

            // Categorías (tags)
            if (data.has("tags") && data.get("tags").isArray()) {
                StringBuilder categories = new StringBuilder();
                int count = 0;
                for (JsonNode tag : data.get("tags")) {
                    if (count >= 5) break; // Limitar a 5 tags
                    if (categories.length() > 0) categories.append(", ");
                    categories.append(tag.get("name").asText());
                    count++;
                }
                gameData.put("categories", categories.toString());
            }

            return gameData;

        } catch (Exception e) {
            System.err.println("Error extracting game data: " + e.getMessage());
            return null;
        }
    }
}