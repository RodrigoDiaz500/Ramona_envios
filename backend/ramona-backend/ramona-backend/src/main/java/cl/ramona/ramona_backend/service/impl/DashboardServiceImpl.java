package cl.ramona.ramona_backend.service.impl;

import cl.ramona.ramona_backend.dto.response.DashboardResponse;
import cl.ramona.ramona_backend.enums.EstadoSolicitud;
import cl.ramona.ramona_backend.repository.SolicitudEnvioRepository;
import cl.ramona.ramona_backend.repository.SucursalRepository;
import cl.ramona.ramona_backend.repository.UsuarioRepository;
import cl.ramona.ramona_backend.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final SolicitudEnvioRepository solicitudEnvioRepository;
    private final UsuarioRepository usuarioRepository;
    private final SucursalRepository sucursalRepository;

    @Override
    public DashboardResponse obtenerResumen() {
        return new DashboardResponse(
                solicitudEnvioRepository.count(),
                solicitudEnvioRepository.countByEstado(EstadoSolicitud.PENDIENTE_APROBACION),
                solicitudEnvioRepository.countByEstado(EstadoSolicitud.APROBADO),
                solicitudEnvioRepository.countByEstado(EstadoSolicitud.EN_PREPARACION),
                solicitudEnvioRepository.countByEstado(EstadoSolicitud.EN_TRANSITO),
                solicitudEnvioRepository.countByEstado(EstadoSolicitud.ENTREGADO),
                solicitudEnvioRepository.countByEstado(EstadoSolicitud.RECHAZADO),
                usuarioRepository.count(),
                sucursalRepository.count()
        );
    }
}