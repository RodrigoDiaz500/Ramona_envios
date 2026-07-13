package cl.ramona.incidenciaservice.dto.response;
import cl.ramona.incidenciaservice.enums.EstadoIncidencia;
import java.time.LocalDateTime;
public record IncidenciaResponse(Long id,Long solicitudEnvioId,String codigoSeguimiento,String titulo,String descripcion,EstadoIncidencia estado,UsuarioResponse creadaPor,UsuarioResponse asignadaA,LocalDateTime fechaCreacion,LocalDateTime fechaActualizacion) {}
