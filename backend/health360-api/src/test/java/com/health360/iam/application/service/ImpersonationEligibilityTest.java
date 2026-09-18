package com.health360.iam.application.service;

import com.health360.config.Health360Properties;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.env.MockEnvironment;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class ImpersonationEligibilityTest {

    private Health360Properties properties;
    private MockEnvironment environment;
    private ImpersonationEligibility eligibility;

    @BeforeEach
    void setUp() {
        properties = new Health360Properties();
        environment = new MockEnvironment();
        eligibility = new ImpersonationEligibility(properties, environment);
    }

    @Test
    void productionAlwaysDeniedEvenWhenFlagTrue() {
        properties.getImpersonation().setEnabled(true);
        environment.setActiveProfiles("production");

        assertThat(eligibility.isEnabled()).isFalse();
        assertThatThrownBy(eligibility::assertEnabled)
                .hasMessageContaining("not available");
    }

    @Test
    void productionPlusFlagFalseDenied() {
        properties.getImpersonation().setEnabled(false);
        environment.setActiveProfiles("production");
        assertThat(eligibility.isEnabled()).isFalse();
    }

    @Test
    void uatStyleProfileDeniedWhenFlagFalse() {
        properties.getImpersonation().setEnabled(false);
        properties.getImpersonation().setAllowedProfiles("local,dev,test,uat");
        environment.setActiveProfiles("uat");
        assertThat(eligibility.isEnabled()).isFalse();
    }

    @Test
    void nonProductionDeniedWhenFlagFalse() {
        properties.getImpersonation().setEnabled(false);
        environment.setActiveProfiles("local");
        assertThat(eligibility.isEnabled()).isFalse();
    }

    @Test
    void localAllowedWhenExplicitlyEnabled() {
        properties.getImpersonation().setEnabled(true);
        environment.setActiveProfiles("local");
        assertThat(eligibility.isEnabled()).isTrue();
        assertThat(eligibility.environmentLabel()).isEqualTo("LOCAL");
    }

    @Test
    void testProfileAllowedWhenExplicitlyEnabled() {
        properties.getImpersonation().setEnabled(true);
        environment.setActiveProfiles("test");
        assertThat(eligibility.isEnabled()).isTrue();
    }

    @Test
    void unknownProfileDeniedEvenIfFlagTrue() {
        properties.getImpersonation().setEnabled(true);
        properties.getImpersonation().setAllowedProfiles("local,dev,test");
        environment.setActiveProfiles("staging");
        assertThat(eligibility.isEnabled()).isFalse();
    }

    @Test
    void productionInAllowedProfilesIsIgnored() {
        properties.getImpersonation().setEnabled(true);
        properties.getImpersonation().setAllowedProfiles("local,production");
        environment.setActiveProfiles("production");
        assertThat(eligibility.allowedProfiles()).doesNotContain("production");
        assertThat(eligibility.isEnabled()).isFalse();
    }

    @Test
    void emptyAllowedProfilesFailClosed() {
        properties.getImpersonation().setEnabled(true);
        properties.getImpersonation().setAllowedProfiles(" ");
        environment.setActiveProfiles("local");
        assertThat(eligibility.isEnabled()).isFalse();
    }
}
