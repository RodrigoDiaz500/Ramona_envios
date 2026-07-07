package cl.ramona.ramona_backend.dto.request;

import cl.ramona.ramona_backend.enums.EstadoIncidencia;
import jakarta.validation.constraints.NotNull;

public record ActualizarEstadoIncidenciaRequest(

        @NotNull(message = "El estado es obligatorio")
        EstadoIncidencia estado,

        Long asignadaAId
) {
}