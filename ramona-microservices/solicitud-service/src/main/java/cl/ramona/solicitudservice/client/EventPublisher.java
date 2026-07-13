package cl.ramona.solicitudservice.client;
import cl.ramona.solicitudservice.dto.request.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
@Slf4j @Component
public class EventPublisher {
 private final RestClient seguimiento; private final RestClient notificacion;
 public EventPublisher(RestClient.Builder builder,@Value("${services.seguimiento.url}") String segUrl,@Value("${services.notificacion.url}") String notUrl){ seguimiento=builder.baseUrl(segUrl).build(); notificacion=builder.baseUrl(notUrl).build(); }
 public void publicarSeguimiento(SeguimientoEventoRequest request){ try{ seguimiento.post().uri("/api/seguimientos").body(request).retrieve().toBodilessEntity(); }catch(Exception ex){ log.warn("No fue posible publicar seguimiento: {}",ex.getMessage()); } }
 public void publicarNotificacion(NotificacionEventoRequest request){ try{ notificacion.post().uri("/api/notificaciones").body(request).retrieve().toBodilessEntity(); }catch(Exception ex){ log.warn("No fue posible publicar notificación: {}",ex.getMessage()); } }
}
