package cl.ramona.resenaservice.service.impl;

import cl.ramona.resenaservice.client.SolicitudClient;
import cl.ramona.resenaservice.client.UsuarioClient;
import cl.ramona.resenaservice.dto.request.ResenaRequest;
import cl.ramona.resenaservice.dto.response.ResenaResponse;
import cl.ramona.resenaservice.dto.response.SolicitudResumen;
import cl.ramona.resenaservice.dto.response.UsuarioResumen;
import cl.ramona.resenaservice.entity.Resena;
import cl.ramona.resenaservice.exception.ResourceNotFoundException;
import cl.ramona.resenaservice.repository.ResenaRepository;
import cl.ramona.resenaservice.service.ResenaService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.Clock;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ResenaServiceImpl implements ResenaService {
    private final ResenaRepository repository;
    private final SolicitudClient solicitudClient;
    private final UsuarioClient usuarioClient;
    private final Clock clock;

    @Override
    @Transactional
    public ResenaResponse crear(ResenaRequest request) {
        if (repository.existsBySolicitudEnvioId(request.solicitudEnvioId())) {
            throw new IllegalArgumentException("Esta solicitud ya tiene una reseña");
        }

        SolicitudResumen solicitud = solicitudClient.obtenerPorId(request.solicitudEnvioId());
        if (!"ENTREGADO".equals(solicitud.estado())) {
            throw new IllegalArgumentException("Solo se pueden reseñar envíos entregados");
        }

        UsuarioResumen usuario = usuarioClient.obtenerPorId(request.usuarioId());
        if (Boolean.FALSE.equals(usuario.activo())) {
            throw new IllegalArgumentException("El usuario se encuentra deshabilitado");
        }

        Resena saved = repository.save(Resena.builder()
                .solicitudEnvioId(request.solicitudEnvioId())
                .usuarioId(request.usuarioId())
                .calificacion(request.calificacion())
                .comentario(request.comentario())
                .fechaCreacion(LocalDateTime.now(clock))
                .build());

        return toResponse(saved, solicitud, usuario);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ResenaResponse> listar() {
        return repository.findAll().stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ResenaResponse> listarPorUsuario(Long usuarioId) {
        usuarioClient.obtenerPorId(usuarioId);
        return repository.findByUsuarioIdOrderByFechaCreacionDesc(usuarioId)
                .stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ResenaResponse obtenerPorSolicitud(Long solicitudEnvioId) {
        Resena resena = repository.findBySolicitudEnvioId(solicitudEnvioId)
                .orElseThrow(() -> new ResourceNotFoundException("Reseña no encontrada para esta solicitud"));
        return toResponse(resena);
    }

    @Override
    @Transactional(readOnly = true)
    public BigDecimal promedioCalificacion() {
        return repository.promedioCalificacion();
    }

    private ResenaResponse toResponse(Resena resena) {
        SolicitudResumen solicitud = solicitudClient.obtenerPorId(resena.getSolicitudEnvioId());
        UsuarioResumen usuario = usuarioClient.obtenerPorId(resena.getUsuarioId());
        return toResponse(resena, solicitud, usuario);
    }

    private ResenaResponse toResponse(Resena resena, SolicitudResumen solicitud, UsuarioResumen usuario) {
        return new ResenaResponse(
                resena.getId(),
                resena.getSolicitudEnvioId(),
                solicitud.codigoSeguimiento(),
                usuario,
                resena.getCalificacion(),
                resena.getComentario(),
                resena.getFechaCreacion()
        );
    }
}
