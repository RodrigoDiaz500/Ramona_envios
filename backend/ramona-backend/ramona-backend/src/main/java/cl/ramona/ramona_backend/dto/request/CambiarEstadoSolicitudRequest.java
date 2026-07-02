package cl.ramona.ramona_backend.dto.request;

import cl.ramona.ramona_backend.enums.EstadoSolicitud;
import jakarta.validation.constraints.NotNull;

public record CambiarEstadoSolicitudRequest(

        @NotNull(message = "El nuevo estado es obligatorio")
        EstadoSolicitud estado,

        Long aprobadoPorId
) {
}