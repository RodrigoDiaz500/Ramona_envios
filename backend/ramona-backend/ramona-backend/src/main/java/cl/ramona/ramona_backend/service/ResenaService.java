package cl.ramona.ramona_backend.service;

import cl.ramona.ramona_backend.dto.request.ResenaRequest;
import cl.ramona.ramona_backend.dto.response.ResenaResponse;

import java.util.List;

public interface ResenaService {

    ResenaResponse crearResena(ResenaRequest request);

    List<ResenaResponse> listarResenas();

    List<ResenaResponse> listarPorUsuario(Long usuarioId);

    ResenaResponse obtenerPorSolicitud(Long solicitudEnvioId);
}