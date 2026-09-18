package com.health360.config;

import com.health360.iam.application.service.ImpersonationEligibility;
import org.junit.jupiter.api.Test;
import org.springframework.mock.env.MockEnvironment;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class ImpersonationStartupValidatorTest {

    @Test
    void failsStartupWhenEnabledWithProductionProfile() {
        Health360Properties properties = new Health360Properties();
        properties.getImpersonation().setEnabled(true);
        MockEnvironment env = new MockEnvironment();
        env.setActiveProfiles("production");
        ImpersonationEligibility eligibility = new ImpersonationEligibility(properties, env);
        ImpersonationStartupValidator validator = new ImpersonationStartupValidator(properties, eligibility);

        assertThatThrownBy(() -> validator.run(null))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("production");
    }

    @Test
    void allowsStartupWhenDisabledOnProduction() {
        Health360Properties properties = new Health360Properties();
        properties.getImpersonation().setEnabled(false);
        MockEnvironment env = new MockEnvironment();
        env.setActiveProfiles("production");
        ImpersonationEligibility eligibility = new ImpersonationEligibility(properties, env);
        ImpersonationStartupValidator validator = new ImpersonationStartupValidator(properties, eligibility);

        assertThatCode(() -> validator.run(null)).doesNotThrowAnyException();
    }

    @Test
    void allowsStartupWhenEnabledOnLocal() {
        Health360Properties properties = new Health360Properties();
        properties.getImpersonation().setEnabled(true);
        MockEnvironment env = new MockEnvironment();
        env.setActiveProfiles("local");
        ImpersonationEligibility eligibility = new ImpersonationEligibility(properties, env);
        ImpersonationStartupValidator validator = new ImpersonationStartupValidator(properties, eligibility);

        assertThatCode(() -> validator.run(null)).doesNotThrowAnyException();
    }
}
