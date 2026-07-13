package cl.ramona.dashboardservice.client;
import cl.ramona.dashboardservice.dto.response.ApiResponse;
import cl.ramona.dashboardservice.dto.response.IncidenciaResumen;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import java.util.List;
@Component
public class IncidenciaClient {
    private final RestClient client;
    public IncidenciaClient(RestClient.Builder builder, @Value("${services.incidencia.url}") String url) { this.client = builder.baseUrl(url).build(); }
    public List<IncidenciaResumen> listar() {
        ApiResponse<List<IncidenciaResumen>> response = client.get().uri("/api/incidencias").retrieve().body(new ParameterizedTypeReference<>() {});
        return response == null || response.data() == null ? List.of() : response.data();
    }
}
