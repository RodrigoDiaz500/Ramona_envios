package cl.ramona.ramona_backend.dto.request;

import jakarta.validation.constraints.*;

public record ResenaRequest(

        @NotNull(message = "La solicitud es obligatoria")
        Long solicitudEnvioId,

        @NotNull(message = "El usuario es obligatorio")
        Long usuarioId,

        @NotNull(message = "La calificación es obligatoria")
        @Min(value = 1, message = "La calificación mínima es 1")
        @Max(value = 5, message = "La calificación máxima es 5")
        Integer calificacion,

        String comentario
) {
}