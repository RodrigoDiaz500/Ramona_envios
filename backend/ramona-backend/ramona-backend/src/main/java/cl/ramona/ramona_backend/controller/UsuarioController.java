package cl.ramona.ramona_backend.controller;

import cl.ramona.ramona_backend.dto.request.UsuarioRequest;
import cl.ramona.ramona_backend.dto.response.ApiResponse;
import cl.ramona.ramona_backend.dto.response.UsuarioResponse;
import cl.ramona.ramona_backend.service.UsuarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioService usuarioService;

    @GetMapping
    public ApiResponse<List<UsuarioResponse>> listarUsuarios() {
        return ApiResponse.ok("Usuarios obtenidos correctamente", usuarioService.listarUsuarios());
    }

    @GetMapping("/{id}")
    public ApiResponse<UsuarioResponse> obtenerUsuarioPorId(@PathVariable Long id) {
        return ApiResponse.ok("Usuario obtenido correctamente", usuarioService.obtenerUsuarioPorId(id));
    }

    @PostMapping
    public ApiResponse<UsuarioResponse> crearUsuario(@Valid @RequestBody UsuarioRequest request) {
        return ApiResponse.ok("Usuario creado correctamente", usuarioService.crearUsuario(request));
    }

    @PutMapping("/{id}")
    public ApiResponse<UsuarioResponse> actualizarUsuario(
            @PathVariable Long id,
            @Valid @RequestBody UsuarioRequest request
    ) {
        return ApiResponse.ok("Usuario actualizado correctamente", usuarioService.actualizarUsuario(id, request));
    }

    @PatchMapping("/{id}/activo")
    public ApiResponse<UsuarioResponse> cambiarEstadoUsuario(
            @PathVariable Long id,
            @RequestParam Boolean activo
    ) {
        return ApiResponse.ok("Estado del usuario actualizado correctamente", usuarioService.cambiarEstadoUsuario(id, activo));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> eliminarUsuario(@PathVariable Long id) {
        usuarioService.eliminarUsuario(id);
        return ApiResponse.ok("Usuario eliminado correctamente", null);
    }
}