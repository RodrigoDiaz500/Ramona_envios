package cl.ramona.ramona_backend.controller;

import cl.ramona.ramona_backend.dto.request.ResenaRequest;
import cl.ramona.ramona_backend.dto.response.ApiResponse;
import cl.ramona.ramona_backend.dto.response.ResenaResponse;
import cl.ramona.ramona_backend.service.ResenaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/resenas")
@RequiredArgsConstructor
public class ResenaController {

    private final ResenaService resenaService;

    @PostMapping
    public ApiResponse<ResenaResponse> crearResena(@Valid @RequestBody ResenaRequest request) {
        return ApiResponse.ok("Reseña creada correctamente", resenaService.crearResena(request));
    }

    @GetMapping
    public ApiResponse<List<ResenaResponse>> listarResenas() {
        return ApiResponse.ok("Reseñas obtenidas correctamente", resenaService.listarResenas());
    }

    @GetMapping("/usuario/{usuarioId}")
    public ApiResponse<List<ResenaResponse>> listarPorUsuario(@PathVariable Long usuarioId) {
        return ApiResponse.ok("Reseñas del usuario obtenidas correctamente", resenaService.listarPorUsuario(usuarioId));
    }

    @GetMapping("/solicitud/{solicitudEnvioId}")
    public ApiResponse<ResenaResponse> obtenerPorSolicitud(@PathVariable Long solicitudEnvioId) {
        return ApiResponse.ok("Reseña obtenida correctamente", resenaService.obtenerPorSolicitud(solicitudEnvioId));
    }
}