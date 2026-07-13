package cl.ramona.authservice.service;

import cl.ramona.authservice.client.UsuarioClient;
import cl.ramona.authservice.dto.RolResponse;
import cl.ramona.authservice.dto.UsuarioRequest;
import cl.ramona.authservice.dto.UsuarioResponse;
import cl.ramona.authservice.exception.UsuarioDeshabilitadoException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private static final String ROL_CLIENTE = "CLIENTE";

    private final UsuarioClient usuarioClient;

    public UsuarioResponse obtenerPerfil(Jwt jwt) {
        String entraId = primerValorNoVacio(
                jwt.getClaimAsString("oid"),
                jwt.getSubject()
        );

        if (entraId == null) {
            throw new IllegalArgumentException(
                    "El token no contiene un identificador de usuario válido"
            );
        }

        String correo = primerValorNoVacio(
                jwt.getClaimAsString("preferred_username"),
                jwt.getClaimAsString("email")
        );

        if (correo == null) {
            throw new IllegalArgumentException(
                    "El token no contiene correo de usuario"
            );
        }

        String nombreCompleto = jwt.getClaimAsString("name");

        UsuarioResponse usuario = usuarioClient.buscarPorEntraId(entraId)
                .orElseGet(() -> vincularOCrear(
                        entraId,
                        correo,
                        nombreCompleto
                ));

        if (!Boolean.TRUE.equals(usuario.activo())) {
            throw new UsuarioDeshabilitadoException();
        }

        return usuario;
    }

    private UsuarioResponse vincularOCrear(
            String entraId,
            String correo,
            String nombreCompleto
    ) {
        return usuarioClient.buscarPorCorreo(correo)
                .map(usuario -> usuarioClient.actualizar(
                        usuario.id(),
                        new UsuarioRequest(
                                usuario.nombre(),
                                usuario.apellido(),
                                usuario.correo(),
                                usuario.telefono(),
                                usuario.direccion(),
                                entraId,
                                usuario.rol().id()
                        )
                ))
                .orElseGet(() -> crearUsuarioCliente(
                        entraId,
                        correo,
                        nombreCompleto
                ));
    }

    private UsuarioResponse crearUsuarioCliente(
            String entraId,
            String correo,
            String nombreCompleto
    ) {
        RolResponse rolCliente = usuarioClient.buscarRolPorNombre(ROL_CLIENTE);

        return usuarioClient.crear(
                new UsuarioRequest(
                        obtenerNombre(nombreCompleto),
                        obtenerApellido(nombreCompleto),
                        correo,
                        "",
                        "",
                        entraId,
                        rolCliente.id()
                )
        );
    }

    private String primerValorNoVacio(String first, String second) {
        if (first != null && !first.isBlank()) {
            return first;
        }

        if (second != null && !second.isBlank()) {
            return second;
        }

        return null;
    }

    String obtenerNombre(String nombreCompleto) {
        if (nombreCompleto == null || nombreCompleto.isBlank()) {
            return "Usuario";
        }

        return nombreCompleto.trim().split("\\s+")[0];
    }

    String obtenerApellido(String nombreCompleto) {
        if (nombreCompleto == null || nombreCompleto.isBlank()) {
            return "Microsoft";
        }

        String[] partes = nombreCompleto.trim().split("\\s+");

        return partes.length > 1
                ? partes[partes.length - 1]
                : "Microsoft";
    }
}
