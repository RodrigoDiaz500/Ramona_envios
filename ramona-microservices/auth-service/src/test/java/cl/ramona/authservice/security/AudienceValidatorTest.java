package cl.ramona.authservice.security;

import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.jwt.Jwt;

import java.time.Instant;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class AudienceValidatorTest {
    @Test
    void aceptaAudienceCorrecta() {
        var result = new AudienceValidator("api-id").validate(jwt(List.of("api-id")));
        assertFalse(result.hasErrors());
    }

    @Test
    void rechazaAudienceIncorrecta() {
        var result = new AudienceValidator("api-id").validate(jwt(List.of("otra-api")));
        assertTrue(result.hasErrors());
    }

    private Jwt jwt(List<String> audience) {
        return new Jwt("token", Instant.now(), Instant.now().plusSeconds(60),
                Map.of("alg", "none"), Map.of("aud", audience));
    }
}
