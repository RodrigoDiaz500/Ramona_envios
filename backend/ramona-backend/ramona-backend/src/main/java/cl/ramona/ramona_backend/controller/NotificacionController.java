package cl.ramona.ramona_backend.controller;

import cl.ramona.ramona_backend.dto.request.NotificacionRequest;
import cl.ramona.ramona_backend.dto.response.ApiResponse;
import cl.ramona.ramona_backend.dto.response.NotificacionResponse;
import cl.ramona.ramona_backend.service.NotificacionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notificaciones")
@RequiredArgsConstructor
public class NotificacionController {

    private final NotificacionService notificacionService;

    @PostMapping
    public ApiResponse<NotificacionResponse> crearNotificacion(@Valid @RequestBody NotificacionRequest request) {
        return ApiResponse.ok("Notificación creada correctamente", notificacionService.crearNotificacion(request));
    }

    @GetMapping("/usuario/{usuarioId}")
    public ApiResponse<List<NotificacionResponse>> listarPorUsuario(@PathVariable Long usuarioId) {
        return ApiResponse.ok("Notificaciones obtenidas correctamente", notificacionService.listarPorUsuario(usuarioId));
    }

    @PatchMapping("/{id}/leida")
    public ApiResponse<NotificacionResponse> marcarComoLeida(@PathVariable Long id) {
        return ApiResponse.ok("Notificación marcada como leída", notificacionService.marcarComoLeida(id));
    }

    @GetMapping("/usuario/{usuarioId}/no-leidas")
    public ApiResponse<Long> contarNoLeidas(@PathVariable Long usuarioId) {
        return ApiResponse.ok("Cantidad de notificaciones no leídas obtenida correctamente", notificacionService.contarNoLeidas(usuarioId));
    }
}