package cl.ramona.seguimientoservice.service.impl;

import cl.ramona.seguimientoservice.client.SolicitudClient;
import cl.ramona.seguimientoservice.client.UsuarioClient;
import cl.ramona.seguimientoservice.dto.request.SeguimientoRequest;
import cl.ramona.seguimientoservice.dto.response.SeguimientoResponse;
import cl.ramona.seguimientoservice.dto.response.SolicitudResumenResponse;
import cl.ramona.seguimientoservice.dto.response.UsuarioResponse;
import cl.ramona.seguimientoservice.entity.Seguimiento;
import cl.ramona.seguimientoservice.repository.SeguimientoRepository;
import cl.ramona.seguimientoservice.service.SeguimientoService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.Clock;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SeguimientoServiceImpl implements SeguimientoService {
    private final SeguimientoRepository repository;
    private final SolicitudClient solicitudClient;
    private final UsuarioClient usuarioClient;
    private final Clock clock;

    @Override
    public SeguimientoResponse crearSeguimiento(SeguimientoRequest request) {
        SolicitudResumenResponse solicitud = solicitudClient.obtenerPorId(request.solicitudEnvioId());
        UsuarioResponse usuario = usuarioClient.obtenerPorId(request.usuarioId());

        Seguimiento entity = Seguimiento.builder()
                .solicitudEnvioId(request.solicitudEnvioId())
                .estado(request.estado())
                .descripcion(request.descripcion())
                .fechaEvento(LocalDateTime.now(clock))
                .usuarioId(request.usuarioId())
                .build();

        return toResponse(repository.save(entity), solicitud.codigoSeguimiento(), usuario);
    }

    @Override
    public List<SeguimientoResponse> listarPorSolicitud(Long solicitudEnvioId) {
        SolicitudResumenResponse solicitud = solicitudClient.obtenerPorId(solicitudEnvioId);
        return repository.findBySolicitudEnvioIdOrderByFechaEventoAsc(solicitudEnvioId)
                .stream()
                .map(item -> toResponse(item, solicitud.codigoSeguimiento(), usuarioClient.obtenerPorId(item.getUsuarioId())))
                .toList();
    }

    private SeguimientoResponse toResponse(Seguimiento item, String codigo, UsuarioResponse usuario) {
        return new SeguimientoResponse(
                item.getId(),
                item.getSolicitudEnvioId(),
                codigo,
                item.getEstado(),
                item.getDescripcion(),
                item.getFechaEvento(),
                usuario
        );
    }
}
