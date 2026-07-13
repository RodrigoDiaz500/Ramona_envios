package cl.ramona.resenaservice.controller;

import cl.ramona.resenaservice.dto.request.ResenaRequest;
import cl.ramona.resenaservice.dto.response.ApiResponse;
import cl.ramona.resenaservice.dto.response.ResenaResponse;
import cl.ramona.resenaservice.service.ResenaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/resenas")
@RequiredArgsConstructor
public class ResenaController {
    private final ResenaService service;

    @PostMapping
    public ApiResponse<ResenaResponse> crear(@Valid @RequestBody ResenaRequest request) {
        return ApiResponse.ok("Reseña creada correctamente", service.crear(request));
    }

    @GetMapping
    public ApiResponse<List<ResenaResponse>> listar() {
        return ApiResponse.ok("Reseñas obtenidas correctamente", service.listar());
    }

    @GetMapping("/usuario/{usuarioId}")
    public ApiResponse<List<ResenaResponse>> listarPorUsuario(@PathVariable Long usuarioId) {
        return ApiResponse.ok("Reseñas del usuario obtenidas correctamente", service.listarPorUsuario(usuarioId));
    }

    @GetMapping("/solicitud/{solicitudEnvioId}")
    public ApiResponse<ResenaResponse> obtenerPorSolicitud(@PathVariable Long solicitudEnvioId) {
        return ApiResponse.ok("Reseña obtenida correctamente", service.obtenerPorSolicitud(solicitudEnvioId));
    }

    @GetMapping("/promedio")
    public ApiResponse<BigDecimal> promedio() {
        return ApiResponse.ok("Promedio obtenido correctamente", service.promedioCalificacion());
    }
}
