package cl.ramona.notificacionservice.controller;

import cl.ramona.notificacionservice.dto.request.NotificacionRequest;
import cl.ramona.notificacionservice.dto.response.ApiResponse;
import cl.ramona.notificacionservice.dto.response.NotificacionResponse;
import cl.ramona.notificacionservice.service.NotificacionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notificaciones")
@RequiredArgsConstructor
public class NotificacionController {

    private final NotificacionService service;

    @PostMapping
    public ApiResponse<NotificacionResponse> crear(@Valid @RequestBody NotificacionRequest request) {
        return ApiResponse.ok("Notificación creada correctamente", service.crear(request));
    }

    @GetMapping("/usuario/{usuarioId}")
    public ApiResponse<List<NotificacionResponse>> listarPorUsuario(@PathVariable Long usuarioId) {
        return ApiResponse.ok("Notificaciones obtenidas correctamente", service.listarPorUsuario(usuarioId));
    }

    @PatchMapping("/{id}/leida")
    public ApiResponse<NotificacionResponse> marcarComoLeida(@PathVariable Long id) {
        return ApiResponse.ok("Notificación marcada como leída", service.marcarComoLeida(id));
    }

    @GetMapping("/usuario/{usuarioId}/no-leidas")
    public ApiResponse<Long> contarNoLeidas(@PathVariable Long usuarioId) {
        return ApiResponse.ok("Cantidad de notificaciones no leídas obtenida correctamente", service.contarNoLeidas(usuarioId));
    }
}
