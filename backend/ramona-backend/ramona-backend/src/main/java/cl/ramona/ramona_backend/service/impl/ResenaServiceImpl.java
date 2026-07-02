package cl.ramona.ramona_backend.service.impl;

import cl.ramona.ramona_backend.dto.request.ResenaRequest;
import cl.ramona.ramona_backend.dto.response.*;
import cl.ramona.ramona_backend.entity.*;
import cl.ramona.ramona_backend.enums.EstadoSolicitud;
import cl.ramona.ramona_backend.exception.ResourceNotFoundException;
import cl.ramona.ramona_backend.repository.*;
import cl.ramona.ramona_backend.service.ResenaService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ResenaServiceImpl implements ResenaService {

    private final ResenaRepository resenaRepository;
    private final SolicitudEnvioRepository solicitudEnvioRepository;
    private final UsuarioRepository usuarioRepository;

    @Override
    public ResenaResponse crearResena(ResenaRequest request) {
        if (resenaRepository.existsBySolicitudEnvioId(request.solicitudEnvioId())) {
            throw new IllegalArgumentException("Esta solicitud ya tiene una reseña");
        }

        SolicitudEnvio solicitud = solicitudEnvioRepository.findById(request.solicitudEnvioId())
                .orElseThrow(() -> new ResourceNotFoundException("Solicitud no encontrada"));

        if (solicitud.getEstado() != EstadoSolicitud.ENTREGADO) {
            throw new IllegalArgumentException("Solo se pueden reseñar envíos entregados");
        }

        Usuario usuario = usuarioRepository.findById(request.usuarioId())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        Resena resena = Resena.builder()
                .solicitudEnvio(solicitud)
                .usuario(usuario)
                .calificacion(request.calificacion())
                .comentario(request.comentario())
                .fechaCreacion(LocalDateTime.now())
                .build();

        return toResponse(resenaRepository.save(resena));
    }

    @Override
    public List<ResenaResponse> listarResenas() {
        return resenaRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public List<ResenaResponse> listarPorUsuario(Long usuarioId) {
        return resenaRepository.findByUsuarioId(usuarioId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public ResenaResponse obtenerPorSolicitud(Long solicitudEnvioId) {
        Resena resena = resenaRepository.findBySolicitudEnvioId(solicitudEnvioId)
                .orElseThrow(() -> new ResourceNotFoundException("Reseña no encontrada para esta solicitud"));

        return toResponse(resena);
    }

    private ResenaResponse toResponse(Resena resena) {
        return new ResenaResponse(
                resena.getId(),
                resena.getSolicitudEnvio().getId(),
                resena.getSolicitudEnvio().getCodigoSeguimiento(),
                toUsuarioResponse(resena.getUsuario()),
                resena.getCalificacion(),
                resena.getComentario(),
                resena.getFechaCreacion()
        );
    }

    private UsuarioResponse toUsuarioResponse(Usuario usuario) {
        return new UsuarioResponse(
                usuario.getId(),
                usuario.getNombre(),
                usuario.getApellido(),
                usuario.getCorreo(),
                usuario.getTelefono(),
                usuario.getDireccion(),
                usuario.getActivo(),
                usuario.getEntraId(),
                new RolResponse(usuario.getRol().getId(), usuario.getRol().getNombre()),
                usuario.getFechaCreacion(),
                usuario.getFechaActualizacion()
        );
    }
}