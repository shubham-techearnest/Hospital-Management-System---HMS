package com.health360.hospital.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.util.UUID;

@Value
@Builder
public class GalleryImageResponse {
    UUID id;
    String caption;
    int displayOrder;
    long fileSizeBytes;
    String mimeType;
    String imageUrl;
}
