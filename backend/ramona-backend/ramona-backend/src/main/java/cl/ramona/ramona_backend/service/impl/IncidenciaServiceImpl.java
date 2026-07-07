package cl.ramona.ramona_backend.service.impl;

import cl.ramona.ramona_backend.dto.request.ActualizarEstadoIncidenciaRequest;
import cl.ramona.ramona_backend.dto.request.IncidenciaRequest;
import cl.ramona.ramona_backend.dto.response.*;
import cl.ramona.ramona_backend.entity.*;
import cl.ramona.ramona_backend.enums.EstadoIncidencia;
import cl.ramona.ramona_backend.exception.ResourceNotFoundException;
import cl.ramona.ramona_backend.repository.*;
import cl.ramona.ramona_backend.service.IncidenciaService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class IncidenciaServiceImpl implements IncidenciaService {

    private final IncidenciaRepository incidenciaRepository;
    private final SolicitudEnvioRepository solicitudEnvioRepository;
    private final UsuarioRepository usuarioRepository;

    @Override
    public IncidenciaResponse crearIncidencia(IncidenciaRequest request) {
        SolicitudEnvio solicitud = solicitudEnvioRepository.findById(request.solicitudEnvioId())
                .orElseThrow(() -> new ResourceNotFoundException("Solicitud no encontrada"));

        Usuario creador = usuarioRepository.findById(request.creadaPorId())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario creador no encontrado"));

        Usuario asignado = null;

        if (request.asignadaAId() != null) {
            asignado = usuarioRepository.findById(request.asignadaAId())
                    .orElseThrow(() -> new ResourceNotFoundException("Usuario asignado no encontrado"));
        }

        Incidencia incidencia = Incidencia.builder()
                .solicitudEnvio(solicitud)
                .titulo(request.titulo())
                .descripcion(request.descripcion())
                .estado(EstadoIncidencia.ABIERTA)
                .creadaPor(creador)
                .asignadaA(asignado)
                .fechaCreacion(LocalDateTime.now())
                .fechaActualizacion(LocalDateTime.now())
                .build();

        return toResponse(incidenciaRepository.save(incidencia));
    }

    @Override
    public List<IncidenciaResponse> listarIncidencias() {
        return incidenciaRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public IncidenciaResponse obtenerPorId(Long id) {
        return toResponse(buscarIncidencia(id));
    }

    @Override
    public List<IncidenciaResponse> listarPorSolicitud(Long solicitudEnvioId) {
        return incidenciaRepository.findBySolicitudEnvioId(solicitudEnvioId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public List<IncidenciaResponse> listarPorEstado(EstadoIncidencia estado) {
        return incidenciaRepository.findByEstado(estado)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public IncidenciaResponse actualizarEstado(Long id, ActualizarEstadoIncidenciaRequest request) {
        Incidencia incidencia = buscarIncidencia(id);

        Usuario asignado = incidencia.getAsignadaA();

        if (request.asignadaAId() != null) {
            asignado = usuarioRepository.findById(request.asignadaAId())
                    .orElseThrow(() -> new ResourceNotFoundException("Usuario asignado no encontrado"));
        }

        incidencia.setEstado(request.estado());
        incidencia.setAsignadaA(asignado);
        incidencia.setFechaActualizacion(LocalDateTime.now());

        return toResponse(incidenciaRepository.save(incidencia));
    }

    private Incidencia buscarIncidencia(Long id) {
        return incidenciaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Incidencia no encontrada"));
    }

    private IncidenciaResponse toResponse(Incidencia incidencia) {
        return new IncidenciaResponse(
                incidencia.getId(),
                incidencia.getSolicitudEnvio().getId(),
                incidencia.getSolicitudEnvio().getCodigoSeguimiento(),
                incidencia.getTitulo(),
                incidencia.getDescripcion(),
                incidencia.getEstado(),
                toUsuarioResponse(incidencia.getCreadaPor()),
                incidencia.getAsignadaA() != null ? toUsuarioResponse(incidencia.getAsignadaA()) : null,
                incidencia.getFechaCreacion(),
                incidencia.getFechaActualizacion()
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