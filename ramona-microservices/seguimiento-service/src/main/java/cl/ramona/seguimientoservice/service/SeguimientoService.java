package cl.ramona.seguimientoservice.service;
import cl.ramona.seguimientoservice.dto.request.SeguimientoRequest;
import cl.ramona.seguimientoservice.dto.response.SeguimientoResponse;
import java.util.List;
public interface SeguimientoService { SeguimientoResponse crearSeguimiento(SeguimientoRequest request); List<SeguimientoResponse> listarPorSolicitud(Long solicitudEnvioId); }
