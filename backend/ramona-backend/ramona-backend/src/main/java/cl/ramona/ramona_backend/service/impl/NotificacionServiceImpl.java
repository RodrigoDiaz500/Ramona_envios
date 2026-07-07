package cl.ramona.ramona_backend.service.impl;

import cl.ramona.ramona_backend.dto.request.NotificacionRequest;
import cl.ramona.ramona_backend.dto.response.*;
import cl.ramona.ramona_backend.entity.Notificacion;
import cl.ramona.ramona_backend.entity.Usuario;
import cl.ramona.ramona_backend.exception.ResourceNotFoundException;
import cl.ramona.ramona_backend.repository.NotificacionRepository;
import cl.ramona.ramona_backend.repository.UsuarioRepository;
import cl.ramona.ramona_backend.service.NotificacionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificacionServiceImpl implements NotificacionService {

    private final NotificacionRepository notificacionRepository;
    private final UsuarioRepository usuarioRepository;

    @Override
    public NotificacionResponse crearNotificacion(NotificacionRequest request) {
        Usuario usuario = usuarioRepository.findById(request.usuarioId())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        Notificacion notificacion = Notificacion.builder()
                .usuario(usuario)
                .titulo(request.titulo())
                .mensaje(request.mensaje())
                .leida(false)
                .fechaCreacion(LocalDateTime.now())
                .build();

        return toResponse(notificacionRepository.save(notificacion));
    }

    @Override
    public List<NotificacionResponse> listarPorUsuario(Long usuarioId) {
        return notificacionRepository.findByUsuarioIdOrderByFechaCreacionDesc(usuarioId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public NotificacionResponse marcarComoLeida(Long id) {
        Notificacion notificacion = notificacionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notificación no encontrada"));

        notificacion.setLeida(true);

        return toResponse(notificacionRepository.save(notificacion));
    }

    @Override
    public long contarNoLeidas(Long usuarioId) {
        return notificacionRepository.countByUsuarioIdAndLeidaFalse(usuarioId);
    }

    private NotificacionResponse toResponse(Notificacion notificacion) {
        return new NotificacionResponse(
                notificacion.getId(),
                toUsuarioResponse(notificacion.getUsuario()),
                notificacion.getTitulo(),
                notificacion.getMensaje(),
                notificacion.getLeida(),
                notificacion.getFechaCreacion()
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