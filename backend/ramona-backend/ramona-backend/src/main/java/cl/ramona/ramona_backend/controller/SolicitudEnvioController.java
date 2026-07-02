package cl.ramona.ramona_backend.controller;

import cl.ramona.ramona_backend.dto.request.CambiarEstadoSolicitudRequest;
import cl.ramona.ramona_backend.dto.request.CrearSolicitudRequest;
import cl.ramona.ramona_backend.dto.response.ApiResponse;
import cl.ramona.ramona_backend.dto.response.SolicitudEnvioResponse;
import cl.ramona.ramona_backend.service.SolicitudEnvioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/solicitudes")
@RequiredArgsConstructor
public class SolicitudEnvioController {

    private final SolicitudEnvioService solicitudEnvioService;

    @PostMapping
    public ApiResponse<SolicitudEnvioResponse> crearSolicitud(
            @Valid @RequestBody CrearSolicitudRequest request
    ) {
        return ApiResponse.ok("Solicitud creada correctamente", solicitudEnvioService.crearSolicitud(request));
    }

    @GetMapping
    public ApiResponse<List<SolicitudEnvioResponse>> listarSolicitudes() {
        return ApiResponse.ok("Solicitudes obtenidas correctamente", solicitudEnvioService.listarSolicitudes());
    }

    @GetMapping("/{id}")
    public ApiResponse<SolicitudEnvioResponse> obtenerPorId(@PathVariable Long id) {
        return ApiResponse.ok("Solicitud obtenida correctamente", solicitudEnvioService.obtenerPorId(id));
    }

    @GetMapping("/codigo/{codigo}")
    public ApiResponse<SolicitudEnvioResponse> obtenerPorCodigo(@PathVariable String codigo) {
        return ApiResponse.ok("Solicitud obtenida correctamente", solicitudEnvioService.obtenerPorCodigo(codigo));
    }

    @GetMapping("/usuario/{usuarioId}")
    public ApiResponse<List<SolicitudEnvioResponse>> listarPorUsuario(@PathVariable Long usuarioId) {
        return ApiResponse.ok("Solicitudes del usuario obtenidas correctamente", solicitudEnvioService.listarPorUsuario(usuarioId));
    }

    @PatchMapping("/{id}/estado")
    public ApiResponse<SolicitudEnvioResponse> cambiarEstado(
            @PathVariable Long id,
            @Valid @RequestBody CambiarEstadoSolicitudRequest request
    ) {
        return ApiResponse.ok("Estado de la solicitud actualizado correctamente", solicitudEnvioService.cambiarEstado(id, request));
    }
}