package cl.ramona.solicitudservice.dto.request;
import cl.ramona.solicitudservice.enums.EstadoSolicitud;
import jakarta.validation.constraints.NotNull;
public record CambiarEstadoSolicitudRequest(@NotNull(message="El nuevo estado es obligatorio") EstadoSolicitud estado, Long aprobadoPorId) {}
