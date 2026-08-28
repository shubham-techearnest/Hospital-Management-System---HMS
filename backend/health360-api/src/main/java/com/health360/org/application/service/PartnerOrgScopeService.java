package com.health360.org.application.service;

import com.health360.config.security.UserPrincipal;
import com.health360.org.infrastructure.persistence.entity.PartnerOrgMembershipEntity;
import com.health360.org.infrastructure.persistence.repository.PartnerOrgMembershipRepository;
import com.health360.shared.domain.ErrorCode;
import com.health360.shared.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@RequiredArgsConstructor
public class PartnerOrgScopeService {

    private final PartnerOrgMembershipRepository membershipRepository;

    public void assertPartnerMember(UserPrincipal principal, UUID partnerOrgId) {
        if (principal.getRoles().contains("PLATFORM_ADMIN")) {
            return;
        }
        PartnerOrgMembershipEntity membership = membershipRepository
                .findByPartnerOrgIdAndUserIdAndDeletedAtIsNull(partnerOrgId, principal.getUserId())
                .orElseThrow(() -> forbidden());
        if (!"ACTIVE".equals(membership.getEmploymentStatus())) {
            throw forbidden();
        }
    }

    public void assertCanReadPartners(UserPrincipal principal) {
        if (!principal.hasPermission("partner:org:read")
                && !principal.hasPermission("partner:nearby:read")
                && !principal.hasPermission("partner:org:write")) {
            throw forbidden();
        }
    }

    public void assertCanWritePartners(UserPrincipal principal) {
        if (!principal.hasPermission("partner:org:write")) {
            throw forbidden();
        }
    }

    private BusinessException forbidden() {
        return new BusinessException(ErrorCode.FORBIDDEN, HttpStatus.FORBIDDEN, "Access denied");
    }
}
