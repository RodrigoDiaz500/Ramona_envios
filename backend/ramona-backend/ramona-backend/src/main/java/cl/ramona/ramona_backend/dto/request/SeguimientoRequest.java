package cl.ramona.ramona_backend.dto.request;

import cl.ramona.ramona_backend.enums.EstadoSolicitud;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record SeguimientoRequest(

        @NotNull(message = "La solicitud es obligatoria")
        Long solicitudEnvioId,

        @NotNull(message = "El estado es obligatorio")
        EstadoSolicitud estado,

        @Size(max = 255, message = "La descripción no puede superar los 255 caracteres")
        String descripcion,

        @NotNull(message = "El usuario es obligatorio")
        Long usuarioId
) {
}