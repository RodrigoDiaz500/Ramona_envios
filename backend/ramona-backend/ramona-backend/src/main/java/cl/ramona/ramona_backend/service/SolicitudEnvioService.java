package cl.ramona.ramona_backend.service;

import cl.ramona.ramona_backend.dto.request.CambiarEstadoSolicitudRequest;
import cl.ramona.ramona_backend.dto.request.CrearSolicitudRequest;
import cl.ramona.ramona_backend.dto.response.SolicitudEnvioResponse;

import java.util.List;

public interface SolicitudEnvioService {

    SolicitudEnvioResponse crearSolicitud(CrearSolicitudRequest request);

    List<SolicitudEnvioResponse> listarSolicitudes();

    SolicitudEnvioResponse obtenerPorId(Long id);

    SolicitudEnvioResponse obtenerPorCodigo(String codigo);

    List<SolicitudEnvioResponse> listarPorUsuario(Long usuarioId);

    SolicitudEnvioResponse cambiarEstado(Long id, CambiarEstadoSolicitudRequest request);
}