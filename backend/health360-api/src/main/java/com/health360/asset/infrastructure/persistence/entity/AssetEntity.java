package com.health360.asset.infrastructure.persistence.entity;

import com.health360.shared.infrastructure.persistence.BaseAuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(schema = "asset", name = "assets")
@Getter
@Setter
public class AssetEntity extends BaseAuditableEntity {

    @Column(name = "hospital_id", nullable = false)
    private UUID hospitalId;

    @Column(name = "branch_id", nullable = false)
    private UUID branchId;

    @Column(name = "category_id", nullable = false)
    private UUID categoryId;

    @Column(name = "department_id")
    private UUID departmentId;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(name = "asset_tag", nullable = false, length = 40)
    private String assetTag;

    @Column(name = "serial_number", length = 80)
    private String serialNumber;

    @Column(length = 100)
    private String manufacturer;

    @Column(length = 100)
    private String model;

    @Column(name = "purchase_date")
    private LocalDate purchaseDate;

    @Column(name = "purchase_cost")
    private BigDecimal purchaseCost;

    @Column(name = "supplier_name", length = 200)
    private String supplierName;

    @Column(name = "warranty_expiry")
    private LocalDate warrantyExpiry;

    @Column(name = "amc_expiry")
    private LocalDate amcExpiry;

    @Column(name = "location_label", length = 200)
    private String locationLabel;

    @Column(nullable = false, length = 20)
    private String status = "AVAILABLE";

    @Column(nullable = false, length = 20)
    private String criticality = "NORMAL";

    @Column(name = "qr_payload", length = 120)
    private String qrPayload;

    @Column(name = "next_pm_at")
    private Instant nextPmAt;

    @Column(name = "next_calibration_at")
    private Instant nextCalibrationAt;

    @Column(name = "commissioned_at")
    private Instant commissionedAt;

    @Column(name = "parent_asset_id")
    private UUID parentAssetId;

    @Column(columnDefinition = "TEXT")
    private String notes;
}
