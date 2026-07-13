package cl.ramona.notificacionservice.service;

import cl.ramona.notificacionservice.dto.request.NotificacionRequest;
import cl.ramona.notificacionservice.dto.response.NotificacionResponse;

import java.util.List;

public interface NotificacionService {
    NotificacionResponse crear(NotificacionRequest request);
    List<NotificacionResponse> listarPorUsuario(Long usuarioId);
    NotificacionResponse marcarComoLeida(Long id);
    long contarNoLeidas(Long usuarioId);
}
