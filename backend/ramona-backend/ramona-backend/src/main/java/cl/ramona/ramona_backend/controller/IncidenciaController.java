package cl.ramona.ramona_backend.controller;

import cl.ramona.ramona_backend.dto.request.ActualizarEstadoIncidenciaRequest;
import cl.ramona.ramona_backend.dto.request.IncidenciaRequest;
import cl.ramona.ramona_backend.dto.response.ApiResponse;
import cl.ramona.ramona_backend.dto.response.IncidenciaResponse;
import cl.ramona.ramona_backend.enums.EstadoIncidencia;
import cl.ramona.ramona_backend.service.IncidenciaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/incidencias")
@RequiredArgsConstructor
public class IncidenciaController {

    private final IncidenciaService incidenciaService;

    @PostMapping
    public ApiResponse<IncidenciaResponse> crearIncidencia(@Valid @RequestBody IncidenciaRequest request) {
        return ApiResponse.ok("Incidencia creada correctamente", incidenciaService.crearIncidencia(request));
    }

    @GetMapping
    public ApiResponse<List<IncidenciaResponse>> listarIncidencias() {
        return ApiResponse.ok("Incidencias obtenidas correctamente", incidenciaService.listarIncidencias());
    }

    @GetMapping("/{id}")
    public ApiResponse<IncidenciaResponse> obtenerPorId(@PathVariable Long id) {
        return ApiResponse.ok("Incidencia obtenida correctamente", incidenciaService.obtenerPorId(id));
    }

    @GetMapping("/solicitud/{solicitudEnvioId}")
    public ApiResponse<List<IncidenciaResponse>> listarPorSolicitud(@PathVariable Long solicitudEnvioId) {
        return ApiResponse.ok("Incidencias de la solicitud obtenidas correctamente", incidenciaService.listarPorSolicitud(solicitudEnvioId));
    }

    @GetMapping("/estado/{estado}")
    public ApiResponse<List<IncidenciaResponse>> listarPorEstado(@PathVariable EstadoIncidencia estado) {
        return ApiResponse.ok("Incidencias por estado obtenidas correctamente", incidenciaService.listarPorEstado(estado));
    }

    @PatchMapping("/{id}/estado")
    public ApiResponse<IncidenciaResponse> actualizarEstado(
            @PathVariable Long id,
            @Valid @RequestBody ActualizarEstadoIncidenciaRequest request
    ) {
        return ApiResponse.ok("Estado de incidencia actualizado correctamente", incidenciaService.actualizarEstado(id, request));
    }
}