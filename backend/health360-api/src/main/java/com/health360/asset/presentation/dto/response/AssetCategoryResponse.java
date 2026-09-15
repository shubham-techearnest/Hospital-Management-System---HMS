package com.health360.asset.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.util.UUID;

@Value
@Builder
public class AssetCategoryResponse {
    UUID categoryId;
    String code;
    String name;
    String description;
    boolean active;
}
