package cl.ramona.seguimientoservice.client;

import cl.ramona.seguimientoservice.dto.response.ApiResponse;
import cl.ramona.seguimientoservice.dto.response.UsuarioResponse;
import cl.ramona.seguimientoservice.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

@Component
public class UsuarioClient {
    private final RestClient restClient;
    private final String baseUrl;

    public UsuarioClient(RestClient restClient, @Value("${services.usuario.url}") String baseUrl) {
        this.restClient = restClient;
        this.baseUrl = baseUrl;
    }

    public UsuarioResponse obtenerPorId(Long id) {
        try {
            ApiResponse<UsuarioResponse> response = restClient.get()
                    .uri(baseUrl + "/api/usuarios/{id}", id)
                    .retrieve()
                    .body(new ParameterizedTypeReference<>() {});
            if (response == null || response.data() == null) {
                throw new ResourceNotFoundException("Usuario no encontrado");
            }
            return response.data();
        } catch (RestClientResponseException ex) {
            throw new ResourceNotFoundException("Usuario no encontrado");
        }
    }
}
