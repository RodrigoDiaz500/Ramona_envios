package cl.ramona.ramona_backend.controller;

import cl.ramona.ramona_backend.dto.response.ApiResponse;
import cl.ramona.ramona_backend.dto.response.RolResponse;
import cl.ramona.ramona_backend.dto.response.UsuarioResponse;
import cl.ramona.ramona_backend.entity.Rol;
import cl.ramona.ramona_backend.entity.Usuario;
import cl.ramona.ramona_backend.repository.RolRepository;
import cl.ramona.ramona_backend.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;

    @GetMapping("/me")
    public ResponseEntity<?> me(@AuthenticationPrincipal Jwt jwt) {

        String entraId = jwt.getClaimAsString("oid");
        String correo = jwt.getClaimAsString("preferred_username");
        String nombreCompleto = jwt.getClaimAsString("name");

        Usuario usuario = usuarioRepository.findByEntraId(entraId)
                .orElseGet(() -> buscarOCrearUsuario(entraId, correo, nombreCompleto));

        if (!Boolean.TRUE.equals(usuario.getActivo())) {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(Map.of(
                            "message",
                            "Tu usuario se encuentra deshabilitado, por lo que no tienes acceso a Ramona Express."
                    ));
        }

        return ResponseEntity.ok(
                ApiResponse.ok(
                        "Usuario autenticado correctamente",
                        toResponse(usuario)
                )
        );
    }

    private Usuario buscarOCrearUsuario(String entraId, String correo, String nombreCompleto) {
        return usuarioRepository.findByCorreo(correo)
                .map(usuarioExistente -> {
                    usuarioExistente.setEntraId(entraId);
                    usuarioExistente.setFechaActualizacion(LocalDateTime.now());
                    return usuarioRepository.save(usuarioExistente);
                })
                .orElseGet(() -> crearUsuarioCliente(entraId, correo, nombreCompleto));
    }

    private Usuario crearUsuarioCliente(String entraId, String correo, String nombreCompleto) {
        Rol rolCliente = rolRepository.findByNombre("CLIENTE")
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.INTERNAL_SERVER_ERROR,
                        "No existe el rol CLIENTE en la base de datos"
                ));

        Usuario usuario = Usuario.builder()
                .nombre(obtenerNombre(nombreCompleto))
                .apellido(obtenerApellido(nombreCompleto))
                .correo(correo)
                .telefono("")
                .direccion("")
                .activo(true)
                .entraId(entraId)
                .rol(rolCliente)
                .fechaCreacion(LocalDateTime.now())
                .fechaActualizacion(LocalDateTime.now())
                .build();

        return usuarioRepository.save(usuario);
    }

    private String obtenerNombre(String nombreCompleto) {
        if (nombreCompleto == null || nombreCompleto.isBlank()) {
            return "Usuario";
        }

        return nombreCompleto.trim().split("\\s+")[0];
    }

    private String obtenerApellido(String nombreCompleto) {
        if (nombreCompleto == null || nombreCompleto.isBlank()) {
            return "Microsoft";
        }

        String[] partes = nombreCompleto.trim().split("\\s+");

        return partes.length > 1
                ? partes[partes.length - 1]
                : "Microsoft";
    }

    private UsuarioResponse toResponse(Usuario usuario) {
        return new UsuarioResponse(
                usuario.getId(),
                usuario.getNombre(),
                usuario.getApellido(),
                usuario.getCorreo(),
                usuario.getTelefono(),
                usuario.getDireccion(),
                usuario.getActivo(),
                usuario.getEntraId(),
                new RolResponse(
                        usuario.getRol().getId(),
                        usuario.getRol().getNombre()
                ),
                usuario.getFechaCreacion(),
                usuario.getFechaActualizacion()
        );
    }
}