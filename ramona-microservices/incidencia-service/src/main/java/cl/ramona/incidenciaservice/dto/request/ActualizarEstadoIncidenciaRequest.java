package cl.ramona.incidenciaservice.dto.request;
import cl.ramona.incidenciaservice.enums.EstadoIncidencia;
import jakarta.validation.constraints.NotNull;
public record ActualizarEstadoIncidenciaRequest(@NotNull(message="El estado es obligatorio") EstadoIncidencia estado,Long asignadaAId) {}
