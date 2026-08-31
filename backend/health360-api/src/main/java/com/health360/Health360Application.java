package com.health360;

import com.health360.config.Health360Properties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication(exclude = UserDetailsServiceAutoConfiguration.class)
@EnableScheduling
@org.springframework.boot.context.properties.EnableConfigurationProperties(Health360Properties.class)
public class Health360Application {

    public static void main(String[] args) {
        SpringApplication.run(Health360Application.class, args);
    }
}
