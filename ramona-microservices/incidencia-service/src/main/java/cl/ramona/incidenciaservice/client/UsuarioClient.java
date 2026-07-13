package cl.ramona.incidenciaservice.client;
import cl.ramona.incidenciaservice.dto.response.*; import cl.ramona.incidenciaservice.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Value; import org.springframework.core.ParameterizedTypeReference; import org.springframework.stereotype.Component; import org.springframework.web.client.RestClient;
@Component public class UsuarioClient {
 private final RestClient client; public UsuarioClient(RestClient.Builder builder,@Value("${services.usuario.url}") String url){client=builder.baseUrl(url).build();}
 public UsuarioResponse obtener(Long id){ try{ ApiResponse<UsuarioResponse> r=client.get().uri("/api/usuarios/{id}",id).retrieve().body(new ParameterizedTypeReference<>(){}); if(r==null||r.data()==null) throw new ResourceNotFoundException("Usuario no encontrado"); return r.data(); }catch(ResourceNotFoundException e){throw e;}catch(Exception e){throw new ResourceNotFoundException("Usuario no encontrado");}}
}
