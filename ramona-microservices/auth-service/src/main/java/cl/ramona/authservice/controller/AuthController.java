package cl.ramona.authservice.controller;

import cl.ramona.authservice.dto.ApiResponse;
import cl.ramona.authservice.dto.UsuarioResponse;
import cl.ramona.authservice.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @GetMapping("/me")
    public ApiResponse<UsuarioResponse> me(@AuthenticationPrincipal Jwt jwt) {
        return ApiResponse.ok(
                "Usuario autenticado correctamente",
                authService.obtenerPerfil(jwt)
        );
    }
}
