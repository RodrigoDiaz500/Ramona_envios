package cl.ramona.usuarioservice.service.impl;

import cl.ramona.usuarioservice.dto.response.RolResponse;
import cl.ramona.usuarioservice.entity.Rol;
import cl.ramona.usuarioservice.exception.ResourceNotFoundException;
import cl.ramona.usuarioservice.repository.RolRepository;
import cl.ramona.usuarioservice.service.RolService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RolServiceImpl implements RolService {

    private final RolRepository rolRepository;

    @Override
    public List<RolResponse> listarRoles() {
        return rolRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public RolResponse obtenerRolPorNombre(String nombre) {
        if (nombre == null || nombre.isBlank()) {
            throw new IllegalArgumentException("El nombre del rol es obligatorio");
        }

        Rol rol = rolRepository.findByNombre(nombre.trim().toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Rol no encontrado: " + nombre
                ));

        return toResponse(rol);
    }

    private RolResponse toResponse(Rol rol) {
        return new RolResponse(
                rol.getId(),
                rol.getNombre()
        );
    }
}
