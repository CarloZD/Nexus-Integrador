package com.nexus.marketplace.dto.cart;

import com.nexus.marketplace.dto.game.GameDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
public class AddToCartRequest {
    private Long gameId;
    private Integer quantity = 1;
}
