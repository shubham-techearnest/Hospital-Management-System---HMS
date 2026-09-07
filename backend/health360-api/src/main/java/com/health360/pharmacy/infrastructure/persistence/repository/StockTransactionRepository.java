package com.health360.pharmacy.infrastructure.persistence.repository;

import com.health360.pharmacy.infrastructure.persistence.entity.StockTransactionEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface StockTransactionRepository extends JpaRepository<StockTransactionEntity, UUID> {
}
