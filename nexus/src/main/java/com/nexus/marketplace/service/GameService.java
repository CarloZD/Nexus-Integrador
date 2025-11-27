package com.nexus.marketplace.service;

import com.nexus.marketplace.domain.Game;
import com.nexus.marketplace.dto.game.GameDTO;
import com.nexus.marketplace.repository.GameRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class GameService {

    @Autowired
    private GameRepository gameRepository;

    @Autowired
    private SteamService steamService;

    @Transactional
    public void importGamesFromSteam() {
        List<Map<String, Object>> steamGames = steamService.getPopularGames();

        for (Map<String, Object> gameData : steamGames) {
            String steamAppId = (String) gameData.get("steamAppId");

            // Verificar si ya existe
            if (!gameRepository.existsBySteamAppId(steamAppId)) {
                Game game = new Game();
                game.setSteamAppId(steamAppId);
                game.setTitle((String) gameData.get("title"));
                game.setShortDescription((String) gameData.get("shortDescription"));
                game.setDescription((String) gameData.get("description"));
                game.setHeaderImage((String) gameData.get("headerImage"));
                game.setBackgroundImage((String) gameData.get("backgroundImage"));
                game.setPrice((BigDecimal) gameData.get("price"));
                game.setIsFree((Boolean) gameData.getOrDefault("isFree", false));
                game.setDeveloper((String) gameData.get("developer"));
                game.setPublisher((String) gameData.get("publisher"));
                game.setReleaseDate((String) gameData.get("releaseDate"));
                game.setGenres((String) gameData.get("genres"));
                game.setCategories((String) gameData.get("categories"));
                game.setActive(true);
                game.setStock(100); // Stock por defecto

                gameRepository.save(game);
                System.out.println("Imported game: " + game.getTitle());
            }
        }
    }

    public List<GameDTO> getAllGames() {
        return gameRepository.findByActiveTrue().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<GameDTO> getLatestGames() {
        return gameRepository.findLatestGames().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<GameDTO> searchGames(String search) {
        return gameRepository.searchGames(search).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public GameDTO getGameById(Long id) {
        Game game = gameRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Juego no encontrado"));
        return convertToDTO(game);
    }

    private GameDTO convertToDTO(Game game) {
        return GameDTO.builder()
                .id(game.getId())
                .steamAppId(game.getSteamAppId())
                .title(game.getTitle())
                .description(game.getDescription())
                .shortDescription(game.getShortDescription())
                .price(game.getPrice())
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
}