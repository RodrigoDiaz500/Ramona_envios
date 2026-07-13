package cl.ramona.incidenciaservice.client;
import cl.ramona.incidenciaservice.dto.response.*; import cl.ramona.incidenciaservice.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Value; import org.springframework.core.ParameterizedTypeReference; import org.springframework.stereotype.Component; import org.springframework.web.client.RestClient;
@Component public class SolicitudClient {
 private final RestClient client; public SolicitudClient(RestClient.Builder builder,@Value("${services.solicitud.url}") String url){client=builder.baseUrl(url).build();}
 public SolicitudResumenResponse obtener(Long id){ try{ ApiResponse<SolicitudResumenResponse> r=client.get().uri("/api/solicitudes/{id}",id).retrieve().body(new ParameterizedTypeReference<>(){}); if(r==null||r.data()==null) throw new ResourceNotFoundException("Solicitud no encontrada"); return r.data(); }catch(ResourceNotFoundException e){throw e;}catch(Exception e){throw new ResourceNotFoundException("Solicitud no encontrada");}}
}
