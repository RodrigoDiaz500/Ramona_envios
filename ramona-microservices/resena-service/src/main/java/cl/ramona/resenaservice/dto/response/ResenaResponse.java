package cl.ramona.resenaservice.dto.response;

import java.time.LocalDateTime;

public record ResenaResponse(
        Long id,
        Long solicitudEnvioId,
        String codigoSeguimiento,
        UsuarioResumen usuario,
        Integer calificacion,
        String comentario,
        LocalDateTime fechaCreacion
) {}
