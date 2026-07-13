package cl.ramona.dashboardservice.client;
import cl.ramona.dashboardservice.dto.response.ApiResponse;
import cl.ramona.dashboardservice.dto.response.SolicitudResumen;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import java.util.List;
@Component
public class SolicitudClient {
    private final RestClient client;
    public SolicitudClient(RestClient.Builder builder, @Value("${services.solicitud.url}") String url) { this.client = builder.baseUrl(url).build(); }
    public List<SolicitudResumen> listar() {
        ApiResponse<List<SolicitudResumen>> response = client.get().uri("/api/solicitudes").retrieve()
                .body(new ParameterizedTypeReference<>() {});
        return response == null || response.data() == null ? List.of() : response.data();
    }
}
