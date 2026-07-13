package cl.ramona.apigateway.security;

import java.net.URL;
import java.util.UUID;

import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.util.StringUtils;

/**
 * Valida emisores v2.0 de Microsoft Entra ID en modo multitenant.
 *
 * El documento de descubrimiento de "common" publica el issuer como:
 * https://login.microsoftonline.com/{tenantid}/v2.0
 *
 * Por eso se comprueba que el claim "iss" sea exactamente el issuer
 * construido con el claim "tid" del mismo token.
 */
public final class MicrosoftMultitenantIssuerValidator
        implements OAuth2TokenValidator<Jwt> {

    private static final String ISSUER_PREFIX =
            "https://login.microsoftonline.com/";

    private static final String ISSUER_SUFFIX = "/v2.0";

    private static final OAuth2Error INVALID_ISSUER = new OAuth2Error(
            "invalid_token",
            "El emisor del token de Microsoft Entra ID no es válido",
            null
    );

    @Override
    public OAuth2TokenValidatorResult validate(Jwt token) {
        String tenantId = token.getClaimAsString("tid");
        URL issuerUrl = token.getIssuer();

        if (!StringUtils.hasText(tenantId) || issuerUrl == null) {
            return OAuth2TokenValidatorResult.failure(INVALID_ISSUER);
        }

        try {
            UUID.fromString(tenantId);
        } catch (IllegalArgumentException exception) {
            return OAuth2TokenValidatorResult.failure(INVALID_ISSUER);
        }

        String expectedIssuer =
                ISSUER_PREFIX + tenantId.toLowerCase() + ISSUER_SUFFIX;

        String actualIssuer = issuerUrl.toString();

        if (expectedIssuer.equalsIgnoreCase(actualIssuer)) {
            return OAuth2TokenValidatorResult.success();
        }

        return OAuth2TokenValidatorResult.failure(INVALID_ISSUER);
    }
}
