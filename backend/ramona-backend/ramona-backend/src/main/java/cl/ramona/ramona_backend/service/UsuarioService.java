package cl.ramona.ramona_backend.service;

import cl.ramona.ramona_backend.dto.request.UsuarioRequest;
import cl.ramona.ramona_backend.dto.response.UsuarioResponse;

import java.util.List;

public interface UsuarioService {

    List<UsuarioResponse> listarUsuarios();

    UsuarioResponse obtenerUsuarioPorId(Long id);

    UsuarioResponse crearUsuario(UsuarioRequest request);

    UsuarioResponse actualizarUsuario(Long id, UsuarioRequest request);

    UsuarioResponse cambiarEstadoUsuario(Long id, Boolean activo);

    UsuarioResponse cambiarRolUsuario(Long id, Long roleId);

    void eliminarUsuario(Long id);
}