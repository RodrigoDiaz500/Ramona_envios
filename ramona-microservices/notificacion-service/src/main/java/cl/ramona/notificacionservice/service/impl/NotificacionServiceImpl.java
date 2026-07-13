package cl.ramona.notificacionservice.service.impl;

import cl.ramona.notificacionservice.client.UsuarioClient;
import cl.ramona.notificacionservice.dto.request.NotificacionRequest;
import cl.ramona.notificacionservice.dto.response.NotificacionResponse;
import cl.ramona.notificacionservice.dto.response.UsuarioResponse;
import cl.ramona.notificacionservice.entity.Notificacion;
import cl.ramona.notificacionservice.exception.ResourceNotFoundException;
import cl.ramona.notificacionservice.repository.NotificacionRepository;
import cl.ramona.notificacionservice.service.NotificacionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class NotificacionServiceImpl implements NotificacionService {

    private final NotificacionRepository repository;
    private final UsuarioClient usuarioClient;

    @Override
    public NotificacionResponse crear(NotificacionRequest request) {
        UsuarioResponse usuario = usuarioClient.obtenerPorId(request.usuarioId());

        Notificacion entity = Notificacion.builder()
                .usuarioId(usuario.id())
                .titulo(request.titulo().trim())
                .mensaje(request.mensaje().trim())
                .leida(false)
                .fechaCreacion(LocalDateTime.now())
                .build();

        return toResponse(repository.save(entity), usuario);
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificacionResponse> listarPorUsuario(Long usuarioId) {
        UsuarioResponse usuario = usuarioClient.obtenerPorId(usuarioId);
        return repository.findByUsuarioIdOrderByFechaCreacionDesc(usuarioId)
                .stream()
                .map(entity -> toResponse(entity, usuario))
                .toList();
    }

    @Override
    public NotificacionResponse marcarComoLeida(Long id) {
        Notificacion entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notificación no encontrada"));

        entity.setLeida(true);
        Notificacion guardada = repository.save(entity);
        UsuarioResponse usuario = usuarioClient.obtenerPorId(guardada.getUsuarioId());

        return toResponse(guardada, usuario);
    }

    @Override
    @Transactional(readOnly = true)
    public long contarNoLeidas(Long usuarioId) {
        return repository.countByUsuarioIdAndLeidaFalse(usuarioId);
    }

    private NotificacionResponse toResponse(Notificacion entity, UsuarioResponse usuario) {
        return new NotificacionResponse(
                entity.getId(),
                usuario,
                entity.getTitulo(),
                entity.getMensaje(),
                entity.getLeida(),
                entity.getFechaCreacion()
        );
    }
}
