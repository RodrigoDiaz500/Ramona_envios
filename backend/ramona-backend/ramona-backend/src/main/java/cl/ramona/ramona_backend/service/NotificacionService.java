package cl.ramona.ramona_backend.service;

import cl.ramona.ramona_backend.dto.request.NotificacionRequest;
import cl.ramona.ramona_backend.dto.response.NotificacionResponse;

import java.util.List;

public interface NotificacionService {

    NotificacionResponse crearNotificacion(NotificacionRequest request);

    List<NotificacionResponse> listarPorUsuario(Long usuarioId);

    NotificacionResponse marcarComoLeida(Long id);

    long contarNoLeidas(Long usuarioId);
}