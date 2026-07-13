package cl.ramona.dashboardservice.client;
import cl.ramona.dashboardservice.dto.response.ApiResponse;
import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import java.util.List;
@Component
public class UsuarioClient {
    private final RestClient client;
    public UsuarioClient(RestClient.Builder builder, @Value("${services.usuario.url}") String url) { this.client = builder.baseUrl(url).build(); }
    public long contar() {
        ApiResponse<List<JsonNode>> response = client.get().uri("/api/usuarios").retrieve().body(new ParameterizedTypeReference<>() {});
        return response == null || response.data() == null ? 0 : response.data().size();
    }
}
