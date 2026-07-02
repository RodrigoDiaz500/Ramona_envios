package cl.ramona.ramona_backend.controller;

import cl.ramona.ramona_backend.dto.request.SeguimientoRequest;
import cl.ramona.ramona_backend.dto.response.ApiResponse;
import cl.ramona.ramona_backend.dto.response.SeguimientoResponse;
import cl.ramona.ramona_backend.service.SeguimientoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/seguimientos")
@RequiredArgsConstructor
public class SeguimientoController {

    private final SeguimientoService seguimientoService;

    @PostMapping
    public ApiResponse<SeguimientoResponse> crearSeguimiento(
            @Valid @RequestBody SeguimientoRequest request
    ) {
        return ApiResponse.ok("Seguimiento creado correctamente", seguimientoService.crearSeguimiento(request));
    }

    @GetMapping("/solicitud/{solicitudEnvioId}")
    public ApiResponse<List<SeguimientoResponse>> listarPorSolicitud(
            @PathVariable Long solicitudEnvioId
    ) {
        return ApiResponse.ok(
                "Seguimientos obtenidos correctamente",
                seguimientoService.listarPorSolicitud(solicitudEnvioId)
        );
    }
}