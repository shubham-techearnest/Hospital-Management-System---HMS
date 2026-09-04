package com.health360.billing.infrastructure.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(schema = "billing", name = "saas_invoice_number_sequences")
@IdClass(SaasInvoiceNumberSequenceEntity.Pk.class)
@Getter
@Setter
public class SaasInvoiceNumberSequenceEntity {

    @Id
    @Column(name = "hospital_id", nullable = false)
    private UUID hospitalId;

    @Id
    @Column(nullable = false)
    private Integer year;

    @Column(name = "last_value", nullable = false)
    private Long lastValue = 0L;

    @Version
    @Column(nullable = false)
    private Long version = 0L;

    @Getter
    @Setter
    public static class Pk implements Serializable {
        private UUID hospitalId;
        private Integer year;

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (!(o instanceof Pk pk)) return false;
            return Objects.equals(hospitalId, pk.hospitalId) && Objects.equals(year, pk.year);
        }

        @Override
        public int hashCode() {
            return Objects.hash(hospitalId, year);
        }
    }
}
