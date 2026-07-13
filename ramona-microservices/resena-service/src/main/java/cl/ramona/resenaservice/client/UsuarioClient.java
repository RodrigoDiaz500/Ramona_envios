package cl.ramona.resenaservice.client;

import cl.ramona.resenaservice.dto.response.ApiResponse;
import cl.ramona.resenaservice.dto.response.UsuarioResumen;
import cl.ramona.resenaservice.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

@Component
public class UsuarioClient {
    private final RestClient client;

    public UsuarioClient(RestClient.Builder builder,
                         @Value("${clients.usuario-service-url}") String baseUrl) {
        this.client = builder.baseUrl(baseUrl).build();
    }

    public UsuarioResumen obtenerPorId(Long id) {
        try {
            ApiResponse<UsuarioResumen> response = client.get()
                    .uri("/api/usuarios/{id}", id)
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
