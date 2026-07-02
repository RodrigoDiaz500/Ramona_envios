package cl.ramona.ramona_backend.service.impl;

import cl.ramona.ramona_backend.dto.response.RolResponse;
import cl.ramona.ramona_backend.repository.RolRepository;
import cl.ramona.ramona_backend.service.RolService;
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
                .map(rol -> new RolResponse(
                        rol.getId(),
                        rol.getNombre()
                ))
                .toList();
    }
}