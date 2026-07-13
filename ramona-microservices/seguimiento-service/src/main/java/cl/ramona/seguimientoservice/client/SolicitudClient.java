package cl.ramona.seguimientoservice.client;

import cl.ramona.seguimientoservice.dto.response.ApiResponse;
import cl.ramona.seguimientoservice.dto.response.SolicitudResumenResponse;
import cl.ramona.seguimientoservice.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

@Component
public class SolicitudClient {
    private final RestClient restClient;
    private final String baseUrl;

    public SolicitudClient(RestClient restClient, @Value("${services.solicitud.url}") String baseUrl) {
        this.restClient = restClient;
        this.baseUrl = baseUrl;
    }

    public SolicitudResumenResponse obtenerPorId(Long id) {
        try {
            ApiResponse<SolicitudResumenResponse> response = restClient.get()
                    .uri(baseUrl + "/api/solicitudes/{id}", id)
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
