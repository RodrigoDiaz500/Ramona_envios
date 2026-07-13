package cl.ramona.usuarioservice.service;

import cl.ramona.usuarioservice.dto.response.RolResponse;

import java.util.List;

public interface RolService {

    List<RolResponse> listarRoles();

    RolResponse obtenerRolPorNombre(String nombre);
}
