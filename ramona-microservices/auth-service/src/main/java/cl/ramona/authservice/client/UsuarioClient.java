package cl.ramona.authservice.client;

import cl.ramona.authservice.dto.ApiResponse;
import cl.ramona.authservice.dto.RolResponse;
import cl.ramona.authservice.dto.UsuarioRequest;
import cl.ramona.authservice.dto.UsuarioResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;

import java.util.Optional;

@Component
public class UsuarioClient {

    private final RestClient restClient;

    public UsuarioClient(
            RestClient.Builder builder,
            @Value("${services.usuario.url}") String baseUrl
    ) {
        this.restClient = builder.baseUrl(baseUrl).build();
    }

    public Optional<UsuarioResponse> buscarPorEntraId(String entraId) {
        try {
            ApiResponse<UsuarioResponse> response = restClient.get()
                    .uri("/api/usuarios/buscar/entra-id/{entraId}", entraId)
                    .retrieve()
                    .body(new ParameterizedTypeReference<>() {});

            return optionalData(response);
        } catch (HttpClientErrorException.NotFound ex) {
            return Optional.empty();
        }
    }

    public Optional<UsuarioResponse> buscarPorCorreo(String correo) {
        try {
            ApiResponse<UsuarioResponse> response = restClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/api/usuarios/buscar/correo")
                            .queryParam("correo", correo)
                            .build())
                    .retrieve()
                    .body(new ParameterizedTypeReference<>() {});

            return optionalData(response);
        } catch (HttpClientErrorException.NotFound ex) {
            return Optional.empty();
        }
    }

    public RolResponse buscarRolPorNombre(String nombre) {
        ApiResponse<RolResponse> response = restClient.get()
                .uri("/api/roles/nombre/{nombre}", nombre)
                .retrieve()
                .body(new ParameterizedTypeReference<>() {});

        return requireData(
                response,
                "usuario-service no devolvió el rol solicitado"
        );
    }

    public UsuarioResponse crear(UsuarioRequest request) {
        ApiResponse<UsuarioResponse> response = restClient.post()
                .uri("/api/usuarios")
                .body(request)
                .retrieve()
                .body(new ParameterizedTypeReference<>() {});

        return requireData(
                response,
                "usuario-service no devolvió el usuario creado"
        );
    }

    public UsuarioResponse actualizar(Long id, UsuarioRequest request) {
        ApiResponse<UsuarioResponse> response = restClient.put()
                .uri("/api/usuarios/{id}", id)
                .body(request)
                .retrieve()
                .body(new ParameterizedTypeReference<>() {});

        return requireData(
                response,
                "usuario-service no devolvió el usuario actualizado"
        );
    }

    private <T> Optional<T> optionalData(ApiResponse<T> response) {
        return response == null
                ? Optional.empty()
                : Optional.ofNullable(response.data());
    }

    private <T> T requireData(ApiResponse<T> response, String message) {
        if (response == null || response.data() == null) {
            throw new IllegalStateException(message);
        }

        return response.data();
    }
}
