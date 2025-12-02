package com.nexus.marketplace.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_library", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "game_id"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserLibrary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "game_id", nullable = false)
    private Game game;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    private Order order; // Orden de donde proviene la compra

    @Column(name = "purchase_price", precision = 10, scale = 2)
    private BigDecimal purchasePrice; // Precio al momento de la compra

    @Column(name = "play_time_minutes")
    private Integer playTimeMinutes = 0; // Tiempo jugado (simulado)

    @Column(name = "last_played")
    private LocalDateTime lastPlayed;

    @Column(name = "is_installed")
    private Boolean isInstalled = false; // Simulación de instalado

    @CreationTimestamp
    @Column(name = "acquired_at", nullable = false, updatable = false)
    private LocalDateTime acquiredAt;
}




