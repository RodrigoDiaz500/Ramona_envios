package cl.ramona.ramona_backend.service.impl;

import cl.ramona.ramona_backend.dto.request.CambiarEstadoSolicitudRequest;
import cl.ramona.ramona_backend.dto.request.CrearSolicitudRequest;
import cl.ramona.ramona_backend.dto.response.RolResponse;
import cl.ramona.ramona_backend.dto.response.SolicitudEnvioResponse;
import cl.ramona.ramona_backend.dto.response.SucursalResponse;
import cl.ramona.ramona_backend.dto.response.UsuarioResponse;
import cl.ramona.ramona_backend.entity.Seguimiento;
import cl.ramona.ramona_backend.entity.SolicitudEnvio;
import cl.ramona.ramona_backend.entity.Sucursal;
import cl.ramona.ramona_backend.entity.Usuario;
import cl.ramona.ramona_backend.enums.EstadoSolicitud;
import cl.ramona.ramona_backend.exception.ResourceNotFoundException;
import cl.ramona.ramona_backend.repository.SeguimientoRepository;
import cl.ramona.ramona_backend.repository.SolicitudEnvioRepository;
import cl.ramona.ramona_backend.repository.SucursalRepository;
import cl.ramona.ramona_backend.repository.UsuarioRepository;
import cl.ramona.ramona_backend.service.SolicitudEnvioService;
import cl.ramona.ramona_backend.util.CodigoSeguimientoGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SolicitudEnvioServiceImpl implements SolicitudEnvioService {

    private final SolicitudEnvioRepository solicitudEnvioRepository;
    private final UsuarioRepository usuarioRepository;
    private final SucursalRepository sucursalRepository;
    private final SeguimientoRepository seguimientoRepository;

    @Override
    public SolicitudEnvioResponse crearSolicitud(CrearSolicitudRequest request) {
        Usuario usuario = usuarioRepository.findById(request.usuarioId())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        Sucursal origen = sucursalRepository.findById(request.sucursalOrigenId())
                .orElseThrow(() -> new ResourceNotFoundException("Sucursal de origen no encontrada"));

        Sucursal destino = sucursalRepository.findById(request.sucursalDestinoId())
                .orElseThrow(() -> new ResourceNotFoundException("Sucursal de destino no encontrada"));

        validarSucursales(origen, destino);

        SolicitudEnvio solicitud = SolicitudEnvio.builder()
                .codigoSeguimiento(generarCodigoUnico())
                .usuario(usuario)
                .sucursalOrigen(origen)
                .sucursalDestino(destino)
                .descripcion(request.descripcion())
                .peso(request.peso())
                .valorDeclarado(request.valorDeclarado())
                .estado(EstadoSolicitud.PENDIENTE_APROBACION)
                .destinatarioNombre(request.destinatarioNombre())
                .destinatarioRutDni(request.destinatarioRutDni())
                .destinatarioTelefono(request.destinatarioTelefono())
                .fechaCreacion(LocalDateTime.now())
                .build();

        SolicitudEnvio solicitudGuardada = solicitudEnvioRepository.save(solicitud);

        crearSeguimientoAutomatico(
                solicitudGuardada,
                EstadoSolicitud.PENDIENTE_APROBACION,
                "Solicitud creada y pendiente de aprobación",
                usuario
        );

        return toResponse(solicitudGuardada);
    }

    @Override
    public List<SolicitudEnvioResponse> listarSolicitudes() {
        return solicitudEnvioRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public SolicitudEnvioResponse obtenerPorId(Long id) {
        return toResponse(buscarSolicitud(id));
    }

    @Override
    public SolicitudEnvioResponse obtenerPorCodigo(String codigo) {
        SolicitudEnvio solicitud = solicitudEnvioRepository.findByCodigoSeguimiento(codigo)
                .orElseThrow(() -> new ResourceNotFoundException("Solicitud no encontrada con ese código"));

        return toResponse(solicitud);
    }

    @Override
    public List<SolicitudEnvioResponse> listarPorUsuario(Long usuarioId) {
        return solicitudEnvioRepository.findByUsuarioId(usuarioId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public SolicitudEnvioResponse cambiarEstado(Long id, CambiarEstadoSolicitudRequest request) {
        SolicitudEnvio solicitud = buscarSolicitud(id);

        Usuario usuarioEvento = obtenerUsuarioEvento(solicitud, request);

        solicitud.setEstado(request.estado());

        if (request.estado() == EstadoSolicitud.APROBADO) {
            solicitud.setAprobadoPor(usuarioEvento);
            solicitud.setFechaAprobacion(LocalDateTime.now());
        }

        SolicitudEnvio solicitudActualizada = solicitudEnvioRepository.save(solicitud);

        crearSeguimientoAutomatico(
                solicitudActualizada,
                request.estado(),
                "Estado actualizado a " + request.estado().name(),
                usuarioEvento
        );

        return toResponse(solicitudActualizada);
    }

    private void validarSucursales(Sucursal origen, Sucursal destino) {
        if (!Boolean.TRUE.equals(origen.getHabilitada())) {
            throw new IllegalArgumentException("La sucursal de origen no está habilitada");
        }

        if (!Boolean.TRUE.equals(destino.getHabilitada())) {
            throw new IllegalArgumentException("La sucursal de destino no está habilitada");
        }

        if (origen.getId().equals(destino.getId())) {
            throw new IllegalArgumentException("La sucursal de origen y destino no pueden ser la misma");
        }
    }

    private Usuario obtenerUsuarioEvento(SolicitudEnvio solicitud, CambiarEstadoSolicitudRequest request) {
        if (request.estado() == EstadoSolicitud.APROBADO) {
            if (request.aprobadoPorId() == null) {
                throw new IllegalArgumentException("Debe indicar el usuario que aprueba la solicitud");
            }

            return usuarioRepository.findById(request.aprobadoPorId())
                    .orElseThrow(() -> new ResourceNotFoundException("Usuario aprobador no encontrado"));
        }

        if (request.aprobadoPorId() != null) {
            return usuarioRepository.findById(request.aprobadoPorId())
                    .orElseThrow(() -> new ResourceNotFoundException("Usuario responsable no encontrado"));
        }

        return solicitud.getUsuario();
    }

    private void crearSeguimientoAutomatico(
            SolicitudEnvio solicitud,
            EstadoSolicitud estado,
            String descripcion,
            Usuario usuario
    ) {
        Seguimiento seguimiento = Seguimiento.builder()
                .solicitudEnvio(solicitud)
                .estado(estado)
                .descripcion(descripcion)
                .fechaEvento(LocalDateTime.now())
                .usuario(usuario)
                .build();

        seguimientoRepository.save(seguimiento);
    }

    private SolicitudEnvio buscarSolicitud(Long id) {
        return solicitudEnvioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Solicitud no encontrada"));
    }

    private String generarCodigoUnico() {
        String codigo;

        do {
            codigo = CodigoSeguimientoGenerator.generar();
        } while (solicitudEnvioRepository.existsByCodigoSeguimiento(codigo));

        return codigo;
    }

    private SolicitudEnvioResponse toResponse(SolicitudEnvio solicitud) {
        return new SolicitudEnvioResponse(
                solicitud.getId(),
                solicitud.getCodigoSeguimiento(),
                toUsuarioResponse(solicitud.getUsuario()),
                toSucursalResponse(solicitud.getSucursalOrigen()),
                toSucursalResponse(solicitud.getSucursalDestino()),
                solicitud.getDescripcion(),
                solicitud.getPeso(),
                solicitud.getValorDeclarado(),
                solicitud.getEstado(),
                solicitud.getDestinatarioNombre(),
                solicitud.getDestinatarioRutDni(),
                solicitud.getDestinatarioTelefono(),
                solicitud.getFechaCreacion(),
                solicitud.getFechaAprobacion(),
                solicitud.getAprobadoPor() != null ? toUsuarioResponse(solicitud.getAprobadoPor()) : null
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

    private SucursalResponse toSucursalResponse(Sucursal sucursal) {
        return new SucursalResponse(
                sucursal.getId(),
                sucursal.getNombre(),
                sucursal.getDireccion(),
                sucursal.getCiudad(),
                sucursal.getTelefono(),
                sucursal.getHabilitada(),
                sucursal.getFechaCreacion()
        );
    }
}