package cl.ramona.solicitudservice.client;
import cl.ramona.solicitudservice.dto.response.*;
import cl.ramona.solicitudservice.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
@Component
public class UsuarioClient {
 private final RestClient client;
 public UsuarioClient(RestClient.Builder builder,@Value("${services.usuario.url}") String url){ this.client=builder.baseUrl(url).build(); }
 public UsuarioResponse obtener(Long id){ try { ApiResponse<UsuarioResponse> r=client.get().uri("/api/usuarios/{id}",id).retrieve().body(new org.springframework.core.ParameterizedTypeReference<>(){}); if(r==null||r.data()==null) throw new ResourceNotFoundException("Usuario no encontrado"); return r.data(); } catch(ResourceNotFoundException ex){ throw ex; } catch(Exception ex){ throw new ResourceNotFoundException("Usuario no encontrado"); } }
}
