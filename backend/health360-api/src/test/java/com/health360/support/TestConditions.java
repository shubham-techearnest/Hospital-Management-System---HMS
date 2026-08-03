package com.health360.support;

import org.testcontainers.DockerClientFactory;

public final class TestConditions {

    private TestConditions() {
    }

    public static boolean isDockerAvailable() {
        try {
            DockerClientFactory.instance().client();
            return true;
        } catch (Throwable ignored) {
            return false;
        }
    }
}
