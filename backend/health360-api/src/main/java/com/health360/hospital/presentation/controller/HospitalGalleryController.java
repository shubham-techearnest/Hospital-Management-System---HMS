package com.health360.hospital.presentation.controller;

import com.health360.config.security.UserPrincipal;
import com.health360.hospital.application.service.HospitalGalleryService;
import com.health360.hospital.presentation.dto.response.GalleryImageResponse;
import com.health360.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/hospitals")
@RequiredArgsConstructor
public class HospitalGalleryController {

    private final HospitalGalleryService hospitalGalleryService;

    @GetMapping("/me/gallery")
    @PreAuthorize("hasAuthority('hospital:profile:read')")
    public ResponseEntity<ApiResponse<List<GalleryImageResponse>>> listGallery(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(
                hospitalGalleryService.listGallery(principal.getUserId(), principal.getTenantId())));
    }

    @PostMapping(value = "/me/gallery", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('hospital:profile:write')")
    public ResponseEntity<ApiResponse<GalleryImageResponse>> uploadGalleryImage(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam("file") MultipartFile file,
            @RequestParam(required = false) String caption,
            @RequestParam(required = false) Integer displayOrder) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(
                hospitalGalleryService.uploadImage(
                        principal.getUserId(), principal.getTenantId(), file, caption, displayOrder)));
    }

    @DeleteMapping("/me/gallery/{imageId}")
    @PreAuthorize("hasAuthority('hospital:profile:write')")
    public ResponseEntity<ApiResponse<Void>> deleteGalleryImage(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID imageId) {
        hospitalGalleryService.deleteImage(principal.getUserId(), principal.getTenantId(), imageId);
        return ResponseEntity.ok(ApiResponse.message("Gallery image deleted"));
    }

    @GetMapping("/{hospitalId}/gallery/{imageId}/view")
    public ResponseEntity<org.springframework.core.io.Resource> viewGalleryImage(
            @PathVariable UUID hospitalId,
            @PathVariable UUID imageId) {
        HospitalGalleryService.ImageContent content = hospitalGalleryService.viewImage(hospitalId, imageId);
        return ResponseEntity.ok()
                .contentType(content.contentType())
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline")
                .body(content.resource());
    }
}
