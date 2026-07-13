package cl.ramona.notificacionservice.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record NotificacionRequest(
        @NotNull(message = "El usuario es obligatorio")
        @Positive(message = "El usuario debe ser válido")
        Long usuarioId,

        @NotBlank(message = "El título es obligatorio")
        @Size(max = 150, message = "El título no puede superar los 150 caracteres")
        String titulo,

        @NotBlank(message = "El mensaje es obligatorio")
        String mensaje
) {}
