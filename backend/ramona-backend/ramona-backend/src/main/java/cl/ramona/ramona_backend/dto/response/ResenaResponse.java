package cl.ramona.ramona_backend.dto.response;

import java.time.LocalDateTime;

public record ResenaResponse(
        Long id,
        Long solicitudEnvioId,
        String codigoSeguimiento,
        UsuarioResponse usuario,
        Integer calificacion,
        String comentario,
        LocalDateTime fechaCreacion
) {
}