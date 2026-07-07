package cl.ramona.ramona_backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record NotificacionRequest(

        @NotNull(message = "El usuario es obligatorio")
        Long usuarioId,

        @NotBlank(message = "El título es obligatorio")
        @Size(max = 150, message = "El título no puede superar los 150 caracteres")
        String titulo,

        @NotBlank(message = "El mensaje es obligatorio")
        String mensaje
) {
}