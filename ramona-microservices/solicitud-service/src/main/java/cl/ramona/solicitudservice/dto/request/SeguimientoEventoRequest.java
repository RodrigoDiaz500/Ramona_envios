package cl.ramona.solicitudservice.dto.request;
import cl.ramona.solicitudservice.enums.EstadoSolicitud;
public record SeguimientoEventoRequest(Long solicitudEnvioId, EstadoSolicitud estado, String descripcion, Long usuarioId) {}
