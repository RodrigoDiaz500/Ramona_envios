package cl.ramona.ramona_backend.service.impl;

import cl.ramona.ramona_backend.dto.request.SeguimientoRequest;
import cl.ramona.ramona_backend.dto.response.RolResponse;
import cl.ramona.ramona_backend.dto.response.SeguimientoResponse;
import cl.ramona.ramona_backend.dto.response.UsuarioResponse;
import cl.ramona.ramona_backend.entity.Seguimiento;
import cl.ramona.ramona_backend.entity.SolicitudEnvio;
import cl.ramona.ramona_backend.entity.Usuario;
import cl.ramona.ramona_backend.exception.ResourceNotFoundException;
import cl.ramona.ramona_backend.repository.SeguimientoRepository;
import cl.ramona.ramona_backend.repository.SolicitudEnvioRepository;
import cl.ramona.ramona_backend.repository.UsuarioRepository;
import cl.ramona.ramona_backend.service.SeguimientoService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SeguimientoServiceImpl implements SeguimientoService {

    private final SeguimientoRepository seguimientoRepository;
    private final SolicitudEnvioRepository solicitudEnvioRepository;
    private final UsuarioRepository usuarioRepository;

    @Override
    public SeguimientoResponse crearSeguimiento(SeguimientoRequest request) {
        SolicitudEnvio solicitud = solicitudEnvioRepository.findById(request.solicitudEnvioId())
                .orElseThrow(() -> new ResourceNotFoundException("Solicitud no encontrada"));

        Usuario usuario = usuarioRepository.findById(request.usuarioId())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        Seguimiento seguimiento = Seguimiento.builder()
                .solicitudEnvio(solicitud)
                .estado(request.estado())
                .descripcion(request.descripcion())
                .fechaEvento(LocalDateTime.now())
                .usuario(usuario)
                .build();

        return toResponse(seguimientoRepository.save(seguimiento));
    }

    @Override
    public List<SeguimientoResponse> listarPorSolicitud(Long solicitudEnvioId) {
        return seguimientoRepository.findBySolicitudEnvioIdOrderByFechaEventoAsc(solicitudEnvioId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private SeguimientoResponse toResponse(Seguimiento seguimiento) {
        return new SeguimientoResponse(
                seguimiento.getId(),
                seguimiento.getSolicitudEnvio().getId(),
                seguimiento.getSolicitudEnvio().getCodigoSeguimiento(),
                seguimiento.getEstado(),
                seguimiento.getDescripcion(),
                seguimiento.getFechaEvento(),
                toUsuarioResponse(seguimiento.getUsuario())
        );
    }

    private UsuarioResponse toUsuarioResponse(Usuario usuario) {
        return new UsuarioResponse(
                usuario.getId(),
                usuario.getNombre(),
                usuario.getApellido(),
                usuario.getCorreo(),
                usuario.getTelefono(),
                usuario.getDireccion(),
                usuario.getActivo(),
                usuario.getEntraId(),
                new RolResponse(usuario.getRol().getId(), usuario.getRol().getNombre()),
                usuario.getFechaCreacion(),
                usuario.getFechaActualizacion()
        );
    }
}