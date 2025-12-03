package com.nexus.marketplace.service;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import okhttp3.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Service
public class GroqAIService {

    private static final Logger logger = LoggerFactory.getLogger(GroqAIService.class);
    private final OkHttpClient httpClient;
    private final Gson gson;
    private final String apiKey;
    private final String apiUrl;
    private final String model;

    public GroqAIService(
            @Value("${groq.api.key}") String apiKey,
            @Value("${groq.api.url}") String apiUrl,
            @Value("${groq.model}") String model) {
        this.httpClient = new OkHttpClient();
        this.gson = new Gson();
        this.apiKey = apiKey;
        this.apiUrl = apiUrl;
        this.model = model;

        // Validar configuración
        if (apiKey == null || apiKey.isEmpty() || apiKey.equals("your-api-key-here")) {
            logger.warn("⚠️ Groq API key no configurada. El chatbot no funcionará correctamente.");
        }
        if (apiUrl == null || apiUrl.isEmpty()) {
            logger.warn("⚠️ Groq API URL no configurada.");
        }
        if (model == null || model.isEmpty()) {
            logger.warn("⚠️ Groq model no configurado.");
        }

        logger.info("✅ GroqAIService inicializado con modelo: {}", model);
    }

    public String generateResponse(String systemPrompt, String userMessage, String gameContext) {
        try {
            logger.debug("📤 Enviando solicitud a Groq AI...");
            logger.debug("Modelo: {}", model);
            logger.debug("Mensaje del usuario: {}", userMessage);

            // Construir el prompt completo
            String fullPrompt = buildFullPrompt(systemPrompt, userMessage, gameContext);

            // Construir el cuerpo de la petición
            JsonObject requestBody = new JsonObject();
            requestBody.addProperty("model", model);
            requestBody.addProperty("temperature", 0.7);
            requestBody.addProperty("max_tokens", 500);

            JsonArray messages = new JsonArray();

            // Mensaje del sistema
            JsonObject systemMsg = new JsonObject();
            systemMsg.addProperty("role", "system");
            systemMsg.addProperty("content", fullPrompt);
            messages.add(systemMsg);

            // Mensaje del usuario
            JsonObject userMsg = new JsonObject();
            userMsg.addProperty("role", "user");
            userMsg.addProperty("content", userMessage);
            messages.add(userMsg);

            requestBody.add("messages", messages);

            // Crear la petición HTTP
            RequestBody body = RequestBody.create(
                    requestBody.toString(),
                    MediaType.parse("application/json")
            );

            Request request = new Request.Builder()
                    .url(apiUrl)
                    .post(body)
                    .addHeader("Authorization", "Bearer " + apiKey)
                    .addHeader("Content-Type", "application/json")
                    .build();

            // Ejecutar la petición
            try (Response response = httpClient.newCall(request).execute()) {
                if (!response.isSuccessful()) {
                    String errorBody = response.body() != null ? response.body().string() : "Sin cuerpo de error";
                    logger.error("❌ Error en respuesta de Groq AI. Código: {}, Cuerpo: {}", response.code(), errorBody);
                    throw new IOException("Error en la API de Groq: " + response.code() + " - " + errorBody);
                }

                String responseBody = response.body().string();
                logger.debug("📥 Respuesta recibida de Groq AI: {}", responseBody);

                // Parsear la respuesta
                JsonObject jsonResponse = gson.fromJson(responseBody, JsonObject.class);
                JsonArray choices = jsonResponse.getAsJsonArray("choices");

                if (choices == null || choices.size() == 0) {
                    logger.error("❌ No se encontraron opciones en la respuesta de Groq AI");
                    return "Lo siento, no pude generar una respuesta. Por favor, intenta de nuevo.";
                }

                JsonObject firstChoice = choices.get(0).getAsJsonObject();
                JsonObject message = firstChoice.getAsJsonObject("message");
                String content = message.get("content").getAsString();

                logger.info("✅ Respuesta generada exitosamente");
                return content;
            }
        } catch (IOException e) {
            logger.error("❌ Error de IO al comunicarse con Groq AI: {}", e.getMessage(), e);
            return "Lo siento, hubo un problema al comunicarme con el servicio de IA. Por favor, intenta de nuevo más tarde.";
        } catch (Exception e) {
            logger.error("❌ Error inesperado en GroqAIService: {}", e.getMessage(), e);
            return "Lo siento, ocurrió un error inesperado. Por favor, intenta de nuevo.";
        }
    }

    private String buildFullPrompt(String systemPrompt, String userMessage, String gameContext) {
        StringBuilder prompt = new StringBuilder();
        prompt.append(systemPrompt);
        
        if (gameContext != null && !gameContext.isEmpty()) {
            prompt.append("\n\n=== CONTEXTO DE JUEGOS DISPONIBLES ===\n");
            prompt.append(gameContext);
            prompt.append("\n=== FIN DEL CONTEXTO ===\n");
        }

        return prompt.toString();
    }

    public String buildSystemPrompt() {
        return """
            Eres NexusBot, el asistente virtual amigable y entusiasta de Nexus Marketplace, una tienda de videojuegos digitales. 
            Tu misión es ayudar a los usuarios a encontrar los juegos perfectos para ellos.
            
            🎮 PERSONALIDAD:
            - Eres amigable, conversacional y entusiasta sobre videojuegos
            - Usas emojis de forma moderada para hacer la conversación más amena
            - Eres profesional pero cercano, como un amigo que conoce mucho de juegos
            - Respondes en español de forma natural y coloquial
            
            📋 INSTRUCCIONES:
            1. Saluda de forma amigable cuando el usuario te escriba por primera vez
            2. Escucha atentamente lo que el usuario busca (género, plataforma, precio, etc.)
            3. Si hay juegos relevantes en el contexto, menciónalos de forma natural en tu respuesta
            4. Si no hay juegos específicos, ofrece ayuda general sobre cómo buscar juegos
            5. Mantén las respuestas concisas pero informativas (máximo 3-4 párrafos)
            6. No inventes información sobre juegos que no están en el contexto
            7. Si el usuario pregunta algo fuera del tema de videojuegos, redirige amablemente la conversación
            
            💡 EJEMPLOS DE RESPUESTAS:
            - "¡Hola! 👋 Me encantaría ayudarte a encontrar el juego perfecto. ¿Qué tipo de juegos te gustan?"
            - "¡Excelente elección! 🎮 Para juegos de acción, tenemos varias opciones increíbles..."
            - "Entiendo que buscas algo específico. Déjame ayudarte a explorar nuestras opciones..."
            
            Recuerda: Sé natural, amigable y útil. ¡Disfruta ayudando a los usuarios a encontrar sus próximos juegos favoritos! 🚀
            """;
    }
}


