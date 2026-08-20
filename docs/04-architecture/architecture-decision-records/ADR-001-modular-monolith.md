# ADR-001: Preserve Modular Monolith

| Status | PROPOSED |
| Date | 2026-08-20 |

## Context
Health360 HMS runs as Spring Boot modular monolith with 17 PostgreSQL schemas.

## Decision
Continue modular monolith; package-per-domain; shared infrastructure.

## Consequences
+ Simpler deployment, transactions, debugging  
− Must enforce module boundaries via code review

## Rejected
Microservices split — premature without scale proof.
