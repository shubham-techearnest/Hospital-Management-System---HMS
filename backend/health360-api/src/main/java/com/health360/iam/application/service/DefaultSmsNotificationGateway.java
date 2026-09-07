package com.health360.iam.application.service;

import com.health360.config.Health360Properties;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * G1 SMS gateway: log stub by default; MSG91 HTTP when {@code health360.sms.provider=msg91}
 * and {@code auth-key} is configured.
 */
@Service
@Slf4j
public class DefaultSmsNotificationGateway implements SmsNotificationGateway {

    private final Health360Properties properties;
    private final RestClient restClient;

    public DefaultSmsNotificationGateway(Health360Properties properties) {
        this.properties = properties;
        this.restClient = RestClient.builder().build();
    }

    @Override
    public boolean send(String phoneE164, String message) {
        Health360Properties.Sms sms = properties.getSms();
        if (sms == null || !sms.isEnabled()) {
            log.debug("SMS skipped (disabled): phone={}", phoneE164);
            return false;
        }
        if (phoneE164 == null || phoneE164.isBlank()) {
            log.warn("SMS skipped: blank phone");
            return false;
        }
        if (message == null || message.isBlank()) {
            log.warn("SMS skipped: blank message");
            return false;
        }

        String provider = sms.getProvider() == null ? "log" : sms.getProvider().trim().toLowerCase();
        boolean hasKey = sms.getAuthKey() != null && !sms.getAuthKey().isBlank();

        if ("msg91".equals(provider) && hasKey) {
            return sendViaMsg91(sms, phoneE164, message);
        }

        log.info("SMS [log-stub] provider={} to {}: {}", provider, phoneE164, message);
        return true;
    }

    private boolean sendViaMsg91(Health360Properties.Sms sms, String phone, String message) {
        String mobile = normalizeIndianMobile(phone);
        try {
            if (sms.getTemplateId() != null && !sms.getTemplateId().isBlank()) {
                return sendMsg91Flow(sms, mobile, message);
            }
            return sendMsg91Http(sms, mobile, message);
        } catch (Exception ex) {
            log.error("MSG91 SMS failed to {}: {}", mobile, ex.getMessage());
            log.info("SMS [fallback-log] to {}: {}", mobile, message);
            return false;
        }
    }

    /**
     * Template / Flow API — preferred for DLT-compliant India SMS.
     * Body variable mapped to {@code VAR1} (configure template accordingly).
     */
    private boolean sendMsg91Flow(Health360Properties.Sms sms, String mobile, String message) {
        String base = blankToDefault(sms.getApiBaseUrl(), "https://control.msg91.com/api/v5");
        Map<String, Object> recipient = new LinkedHashMap<>();
        recipient.put("mobiles", mobile);
        recipient.put("VAR1", truncate(message, 200));

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("template_id", sms.getTemplateId().trim());
        body.put("short_url", "0");
        body.put("recipients", List.of(recipient));

        String response = restClient.post()
                .uri(base.replaceAll("/$", "") + "/flow/")
                .contentType(MediaType.APPLICATION_JSON)
                .header("authkey", sms.getAuthKey().trim())
                .body(body)
                .retrieve()
                .body(String.class);

        log.info("MSG91 flow SMS to {} accepted: {}", mobile, truncate(response, 200));
        return true;
    }

    /** Legacy sendhttp — works when account allows raw message + approved sender. */
    private boolean sendMsg91Http(Health360Properties.Sms sms, String mobile, String message) {
        String base = blankToDefault(sms.getSendHttpUrl(), "https://api.msg91.com/api/sendhttp.php");
        String sender = blankToDefault(sms.getSenderId(), "H360AI");
        String url = base
                + "?authkey=" + encode(sms.getAuthKey().trim())
                + "&mobiles=" + encode(mobile)
                + "&message=" + encode(truncate(message, 500))
                + "&sender=" + encode(sender)
                + "&route=4"
                + "&country=0";

        String response = restClient.get()
                .uri(url)
                .retrieve()
                .body(String.class);

        log.info("MSG91 sendhttp SMS to {} accepted: {}", mobile, truncate(response, 200));
        return true;
    }

    static String normalizeIndianMobile(String phone) {
        String digits = phone.replaceAll("[^0-9]", "");
        if (digits.length() == 10) {
            return "91" + digits;
        }
        if (digits.length() == 12 && digits.startsWith("91")) {
            return digits;
        }
        return digits;
    }

    private static String blankToDefault(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value.trim();
    }

    private static String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }

    private static String truncate(String value, int max) {
        if (value == null) {
            return "";
        }
        return value.length() <= max ? value : value.substring(0, max);
    }
}
