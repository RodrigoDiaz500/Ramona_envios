package cl.ramona.ramona_backend.service;

import cl.ramona.ramona_backend.dto.request.ActualizarEstadoIncidenciaRequest;
import cl.ramona.ramona_backend.dto.request.IncidenciaRequest;
import cl.ramona.ramona_backend.dto.response.IncidenciaResponse;
import cl.ramona.ramona_backend.enums.EstadoIncidencia;

import java.util.List;

public interface IncidenciaService {

    IncidenciaResponse crearIncidencia(IncidenciaRequest request);

    List<IncidenciaResponse> listarIncidencias();

    IncidenciaResponse obtenerPorId(Long id);

    List<IncidenciaResponse> listarPorSolicitud(Long solicitudEnvioId);

    List<IncidenciaResponse> listarPorEstado(EstadoIncidencia estado);

    IncidenciaResponse actualizarEstado(Long id, ActualizarEstadoIncidenciaRequest request);
}