package cl.ramona.seguimientoservice.controller;
import cl.ramona.seguimientoservice.dto.request.SeguimientoRequest;
import cl.ramona.seguimientoservice.dto.response.ApiResponse;
import cl.ramona.seguimientoservice.dto.response.SeguimientoResponse;
import cl.ramona.seguimientoservice.service.SeguimientoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController @RequestMapping("/api/seguimientos") @RequiredArgsConstructor
public class SeguimientoController {
 private final SeguimientoService service;
 @PostMapping public ApiResponse<SeguimientoResponse> crear(@Valid @RequestBody SeguimientoRequest request) { return ApiResponse.ok("Seguimiento creado correctamente", service.crearSeguimiento(request)); }
 @GetMapping("/solicitud/{solicitudEnvioId}") public ApiResponse<List<SeguimientoResponse>> listar(@PathVariable Long solicitudEnvioId) { return ApiResponse.ok("Seguimientos obtenidos correctamente", service.listarPorSolicitud(solicitudEnvioId)); }
}
