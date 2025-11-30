package com.nexus.marketplace.dto.cart;

import com.nexus.marketplace.dto.game.GameDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

// CartDTO.java
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartDTO {
    private Long id;
    private List<CartItemDTO> items;
    private BigDecimal total;
    private Integer itemCount;
}
