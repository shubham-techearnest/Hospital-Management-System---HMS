package com.health360.config;

import com.health360.config.Health360Properties;
import com.health360.iam.application.service.ImpersonationEligibility;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

/**
 * Prevents accidental production enablement of impersonation.
 * Fails startup when {@code enabled=true} with a production profile,
 * or when enabled with no overlapping allowed profile.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class ImpersonationStartupValidator implements ApplicationRunner {

    private final Health360Properties properties;
    private final ImpersonationEligibility eligibility;

    @Override
    public void run(ApplicationArguments args) {
        boolean flag = properties.getImpersonation() != null && properties.getImpersonation().isEnabled();
        if (!flag) {
            log.info("Impersonation disabled (health360.impersonation.enabled=false)");
            return;
        }
        if (eligibility.hasProductionProfile()) {
            throw new IllegalStateException(
                    "FATAL: health360.impersonation.enabled=true is not allowed with the production Spring profile");
        }
        if (eligibility.allowedProfiles().isEmpty()) {
            throw new IllegalStateException(
                    "FATAL: health360.impersonation.enabled=true but allowed-profiles is empty/invalid");
        }
        if (!eligibility.isEnabled()) {
            throw new IllegalStateException(
                    "FATAL: health360.impersonation.enabled=true but active profiles "
                            + eligibility.activeProfiles()
                            + " do not intersect allowed-profiles "
                            + eligibility.allowedProfiles());
        }
        log.warn("Impersonation is ENABLED for environment label={} (DEV/UAT testing only)",
                eligibility.environmentLabel());
    }
}
