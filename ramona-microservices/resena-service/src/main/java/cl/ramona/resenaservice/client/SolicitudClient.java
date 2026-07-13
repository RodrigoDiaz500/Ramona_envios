package cl.ramona.resenaservice.client;

import cl.ramona.resenaservice.dto.response.ApiResponse;
import cl.ramona.resenaservice.dto.response.SolicitudResumen;
import cl.ramona.resenaservice.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

@Component
public class SolicitudClient {
    private final RestClient client;

    public SolicitudClient(RestClient.Builder builder,
                           @Value("${clients.solicitud-service-url}") String baseUrl) {
        this.client = builder.baseUrl(baseUrl).build();
    }

    public SolicitudResumen obtenerPorId(Long id) {
        try {
            ApiResponse<SolicitudResumen> response = client.get()
                    .uri("/api/solicitudes/{id}", id)
                    .retrieve()
                    .body(new ParameterizedTypeReference<>() {});
            if (response == null || response.data() == null) {
                throw new ResourceNotFoundException("Solicitud no encontrada");
            }
            return response.data();
        } catch (RestClientResponseException ex) {
            throw new ResourceNotFoundException("Solicitud no encontrada");
        }
    }
}
