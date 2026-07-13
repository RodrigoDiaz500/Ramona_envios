package cl.ramona.resenaservice.service;

import cl.ramona.resenaservice.dto.request.ResenaRequest;
import cl.ramona.resenaservice.dto.response.ResenaResponse;
import java.math.BigDecimal;
import java.util.List;

public interface ResenaService {
    ResenaResponse crear(ResenaRequest request);
    List<ResenaResponse> listar();
    List<ResenaResponse> listarPorUsuario(Long usuarioId);
    ResenaResponse obtenerPorSolicitud(Long solicitudEnvioId);
    BigDecimal promedioCalificacion();
}
