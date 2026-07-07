package cl.ramona.ramona_backend.dto.response;

import cl.ramona.ramona_backend.enums.EstadoIncidencia;

import java.time.LocalDateTime;

public record IncidenciaResponse(
        Long id,
        Long solicitudEnvioId,
        String codigoSeguimiento,
        String titulo,
        String descripcion,
        EstadoIncidencia estado,
        UsuarioResponse creadaPor,
        UsuarioResponse asignadaA,
        LocalDateTime fechaCreacion,
        LocalDateTime fechaActualizacion
) {
}