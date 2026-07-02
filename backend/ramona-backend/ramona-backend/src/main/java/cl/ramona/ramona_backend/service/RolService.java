package cl.ramona.ramona_backend.service;

import cl.ramona.ramona_backend.dto.response.RolResponse;

import java.util.List;

public interface RolService {

    List<RolResponse> listarRoles();
}