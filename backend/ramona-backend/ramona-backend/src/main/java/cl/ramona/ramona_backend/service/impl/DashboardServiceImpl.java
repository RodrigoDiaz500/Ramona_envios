package cl.ramona.ramona_backend.service.impl;

import cl.ramona.ramona_backend.dto.response.DashboardResponse;
import cl.ramona.ramona_backend.dto.response.UltimaSolicitudResponse;
import cl.ramona.ramona_backend.entity.SolicitudEnvio;
import cl.ramona.ramona_backend.enums.EstadoIncidencia;
import cl.ramona.ramona_backend.enums.EstadoSolicitud;
import cl.ramona.ramona_backend.repository.*;
import cl.ramona.ramona_backend.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final SolicitudEnvioRepository solicitudEnvioRepository;
    private final UsuarioRepository usuarioRepository;
    private final SucursalRepository sucursalRepository;
    private final IncidenciaRepository incidenciaRepository;
    private final ResenaRepository resenaRepository;

    @Override
    public DashboardResponse obtenerResumen() {

        List<UltimaSolicitudResponse> ultimas = solicitudEnvioRepository.findAll()
                .stream()
                .sorted(Comparator.comparing(SolicitudEnvio::getFechaCreacion).reversed())
                .limit(5)
                .map(s -> new UltimaSolicitudResponse(
                        s.getId(),
                        s.getCodigoSeguimiento(),
                        s.getEstado().name(),
                        s.getSucursalOrigen().getCiudad(),
                        s.getSucursalDestino().getCiudad(),
                        s.getDestinatarioNombre()
                ))
                .toList();

        return new DashboardResponse(
                solicitudEnvioRepository.count(),
                solicitudEnvioRepository.countByEstado(EstadoSolicitud.PENDIENTE_APROBACION),
                solicitudEnvioRepository.countByEstado(EstadoSolicitud.APROBADO),
                solicitudEnvioRepository.countByEstado(EstadoSolicitud.EN_PREPARACION),
                solicitudEnvioRepository.countByEstado(EstadoSolicitud.EN_TRANSITO),
                solicitudEnvioRepository.countByEstado(EstadoSolicitud.ENTREGADO),
                solicitudEnvioRepository.countByEstado(EstadoSolicitud.RECHAZADO),
                usuarioRepository.count(),
                sucursalRepository.count(),
                incidenciaRepository.countByEstado(EstadoIncidencia.ABIERTA),
                resenaRepository.promedioCalificacion(),
                ultimas
        );
    }
}