package cl.ramona.notificacionservice.dto.response;

import java.time.LocalDateTime;

public record NotificacionResponse(
        Long id,
        UsuarioResponse usuario,
        String titulo,
        String mensaje,
        Boolean leida,
        LocalDateTime fechaCreacion
) {}
