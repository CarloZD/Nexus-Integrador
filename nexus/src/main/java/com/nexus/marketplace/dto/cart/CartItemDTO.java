package com.nexus.marketplace.dto.cart;

import com.nexus.marketplace.dto.game.GameDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartItemDTO {
    private Long id;
    private GameDTO game;
    private Integer quantity;
    private BigDecimal price;
    private BigDecimal subtotal;
}