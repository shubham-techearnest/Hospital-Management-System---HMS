package com.health360.ipd.infrastructure.persistence.entity;

import com.health360.shared.infrastructure.persistence.BaseAuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(schema = "hospital", name = "ipd_service_settings")
@Getter
@Setter
public class HospitalIpdServiceSettingsEntity extends BaseAuditableEntity {

    @Column(name = "hospital_id", nullable = false)
    private UUID hospitalId;

    @Column(name = "preset_code", length = 40)
    private String presetCode;

    @Column(name = "country_code", nullable = false, length = 2)
    private String countryCode = "IN";

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "enabled_services", nullable = false, columnDefinition = "jsonb")
    private Map<String, Boolean> enabledServices = new HashMap<>();

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "country_config", nullable = false, columnDefinition = "jsonb")
    private Map<String, Object> countryConfig = new HashMap<>();
}
