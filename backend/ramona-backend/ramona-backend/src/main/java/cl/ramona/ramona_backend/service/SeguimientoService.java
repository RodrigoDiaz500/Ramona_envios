package cl.ramona.ramona_backend.service;

import cl.ramona.ramona_backend.dto.request.SeguimientoRequest;
import cl.ramona.ramona_backend.dto.response.SeguimientoResponse;

import java.util.List;

public interface SeguimientoService {

    SeguimientoResponse crearSeguimiento(SeguimientoRequest request);

    List<SeguimientoResponse> listarPorSolicitud(Long solicitudEnvioId);
}