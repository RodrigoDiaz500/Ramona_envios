package cl.ramona.usuarioservice.controller;

import cl.ramona.usuarioservice.dto.response.ApiResponse;
import cl.ramona.usuarioservice.dto.response.RolResponse;
import cl.ramona.usuarioservice.service.RolService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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

    @GetMapping("/nombre/{nombre}")
    public ApiResponse<RolResponse> obtenerRolPorNombre(
            @PathVariable String nombre
    ) {
        return ApiResponse.ok(
                "Rol obtenido correctamente",
                rolService.obtenerRolPorNombre(nombre)
        );
    }
}
