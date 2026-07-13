package cl.ramona.solicitudservice.client;
import cl.ramona.solicitudservice.dto.response.*;
import cl.ramona.solicitudservice.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
@Component
public class SucursalClient {
 private final RestClient client;
 public SucursalClient(RestClient.Builder builder,@Value("${services.sucursal.url}") String url){ this.client=builder.baseUrl(url).build(); }
 public SucursalResponse obtener(Long id){ try { ApiResponse<SucursalResponse> r=client.get().uri("/api/sucursales/{id}",id).retrieve().body(new org.springframework.core.ParameterizedTypeReference<>(){}); if(r==null||r.data()==null) throw new ResourceNotFoundException("Sucursal no encontrada"); return r.data(); } catch(ResourceNotFoundException ex){ throw ex; } catch(Exception ex){ throw new ResourceNotFoundException("Sucursal no encontrada"); } }
}
