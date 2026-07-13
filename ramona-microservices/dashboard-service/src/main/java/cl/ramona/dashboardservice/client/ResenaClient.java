package cl.ramona.dashboardservice.client;
import cl.ramona.dashboardservice.dto.response.ApiResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import java.math.BigDecimal;
@Component
public class ResenaClient {
    private final RestClient client;
    public ResenaClient(RestClient.Builder builder, @Value("${services.resena.url}") String url) { this.client = builder.baseUrl(url).build(); }
    public BigDecimal promedio() {
        ApiResponse<BigDecimal> response = client.get().uri("/api/resenas/promedio").retrieve().body(new ParameterizedTypeReference<>() {});
        return response == null || response.data() == null ? BigDecimal.ZERO : response.data();
    }
}
