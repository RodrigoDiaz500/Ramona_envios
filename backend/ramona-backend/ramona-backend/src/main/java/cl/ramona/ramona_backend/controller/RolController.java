package cl.ramona.ramona_backend.controller;

import cl.ramona.ramona_backend.dto.response.ApiResponse;
import cl.ramona.ramona_backend.dto.response.RolResponse;
import cl.ramona.ramona_backend.service.RolService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/roles")
@RequiredArgsConstructor
public class RolController {

    private final RolService rolService;

    @GetMapping
    public ApiResponse<List<RolResponse>> listarRoles() {
        return ApiResponse.ok(
                "Roles obtenidos correctamente",
                rolService.listarRoles()
        );
    }
}