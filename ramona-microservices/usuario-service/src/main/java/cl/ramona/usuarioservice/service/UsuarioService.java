package cl.ramona.usuarioservice.service;

import cl.ramona.usuarioservice.dto.request.UsuarioRequest;
import cl.ramona.usuarioservice.dto.response.UsuarioResponse;

import java.util.List;

public interface UsuarioService {

    List<UsuarioResponse> listarUsuarios();

    UsuarioResponse obtenerUsuarioPorId(Long id);

    UsuarioResponse obtenerUsuarioPorCorreo(String correo);

    UsuarioResponse obtenerUsuarioPorEntraId(String entraId);

    UsuarioResponse crearUsuario(UsuarioRequest request);

    UsuarioResponse actualizarUsuario(Long id, UsuarioRequest request);

    UsuarioResponse cambiarEstadoUsuario(Long id, Boolean activo);

    UsuarioResponse cambiarRolUsuario(Long id, Long roleId);

    void eliminarUsuario(Long id);
}
