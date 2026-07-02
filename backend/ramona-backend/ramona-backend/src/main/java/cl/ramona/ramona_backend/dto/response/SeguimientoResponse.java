package cl.ramona.ramona_backend.dto.response;

import cl.ramona.ramona_backend.enums.EstadoSolicitud;

import java.time.LocalDateTime;

public record SeguimientoResponse(
        Long id,
        Long solicitudEnvioId,
        String codigoSeguimiento,
        EstadoSolicitud estado,
        String descripcion,
        LocalDateTime fechaEvento,
        UsuarioResponse usuario
) {
}