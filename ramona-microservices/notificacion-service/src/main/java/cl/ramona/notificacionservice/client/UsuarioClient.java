package cl.ramona.notificacionservice.client;

import cl.ramona.notificacionservice.dto.response.ApiResponse;
import cl.ramona.notificacionservice.dto.response.UsuarioResponse;
import cl.ramona.notificacionservice.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Component
@RequiredArgsConstructor
public class UsuarioClient {

    private final RestClient.Builder restClientBuilder;

    @Value("${services.usuario.url}")
    private String usuarioServiceUrl;

    public UsuarioResponse obtenerPorId(Long usuarioId) {
        ApiResponse<UsuarioResponse> response = restClientBuilder.build()
                .get()
                .uri(usuarioServiceUrl + "/api/usuarios/{id}", usuarioId)
                .retrieve()
                .onStatus(HttpStatusCode::is4xxClientError, (request, result) -> {
                    throw new ResourceNotFoundException("Usuario no encontrado");
                })
                .body(new ParameterizedTypeReference<>() {});

        if (response == null || response.data() == null) {
            throw new ResourceNotFoundException("Usuario no encontrado");
        }
        return response.data();
    }
}
