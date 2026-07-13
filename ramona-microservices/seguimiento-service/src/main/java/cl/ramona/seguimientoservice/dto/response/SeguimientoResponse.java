package cl.ramona.seguimientoservice.dto.response;

import cl.ramona.seguimientoservice.enums.EstadoSolicitud;
import java.time.LocalDateTime;

public record SeguimientoResponse(
        Long id,
        Long solicitudEnvioId,
        String codigoSeguimiento,
        EstadoSolicitud estado,
        String descripcion,
        LocalDateTime fechaEvento,
        UsuarioResponse usuario
) {}
