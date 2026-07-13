package cl.ramona.usuarioservice.service.impl;

import cl.ramona.usuarioservice.dto.request.UsuarioRequest;
import cl.ramona.usuarioservice.dto.response.RolResponse;
import cl.ramona.usuarioservice.dto.response.UsuarioResponse;
import cl.ramona.usuarioservice.entity.Rol;
import cl.ramona.usuarioservice.entity.Usuario;
import cl.ramona.usuarioservice.exception.ResourceNotFoundException;
import cl.ramona.usuarioservice.repository.RolRepository;
import cl.ramona.usuarioservice.repository.UsuarioRepository;
import cl.ramona.usuarioservice.service.UsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class UsuarioServiceImpl implements UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;

    @Override
    @Transactional(readOnly = true)
    public List<UsuarioResponse> listarUsuarios() {
        return usuarioRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public UsuarioResponse obtenerUsuarioPorId(Long id) {
        return toResponse(buscarUsuario(id));
    }

    @Override
    @Transactional(readOnly = true)
    public UsuarioResponse obtenerUsuarioPorCorreo(String correo) {
        Usuario usuario = usuarioRepository.findByCorreo(correo)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        return toResponse(usuario);
    }

    @Override
    @Transactional(readOnly = true)
    public UsuarioResponse obtenerUsuarioPorEntraId(String entraId) {
        Usuario usuario = usuarioRepository.findByEntraId(entraId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        return toResponse(usuario);
    }

    @Override
    public UsuarioResponse crearUsuario(UsuarioRequest request) {
        if (usuarioRepository.existsByCorreo(request.correo())) {
            throw new IllegalArgumentException("Ya existe un usuario con ese correo");
        }

        Rol rol = buscarRol(request.roleId());
        LocalDateTime ahora = LocalDateTime.now();

        Usuario usuario = Usuario.builder()
                .nombre(request.nombre())
                .apellido(request.apellido())
                .correo(request.correo())
                .telefono(request.telefono())
                .direccion(request.direccion())
                .entraId(request.entraId())
                .activo(true)
                .rol(rol)
                .fechaCreacion(ahora)
                .fechaActualizacion(ahora)
                .build();

        return toResponse(usuarioRepository.saveAndFlush(usuario));
    }

    @Override
    public UsuarioResponse actualizarUsuario(Long id, UsuarioRequest request) {
        Usuario usuario = buscarUsuario(id);
        Rol rol = buscarRol(request.roleId());

        usuario.setNombre(request.nombre());
        usuario.setApellido(request.apellido());
        usuario.setCorreo(request.correo());
        usuario.setTelefono(request.telefono());
        usuario.setDireccion(request.direccion());
        usuario.setEntraId(request.entraId());
        usuario.setRol(rol);
        usuario.setFechaActualizacion(LocalDateTime.now());

        return toResponse(usuarioRepository.saveAndFlush(usuario));
    }

    @Override
    public UsuarioResponse cambiarEstadoUsuario(Long id, Boolean activo) {
        Usuario usuario = buscarUsuario(id);
        usuario.setActivo(activo);
        usuario.setFechaActualizacion(LocalDateTime.now());

        return toResponse(usuarioRepository.saveAndFlush(usuario));
    }

    @Override
    public UsuarioResponse cambiarRolUsuario(Long id, Long roleId) {
        Usuario usuario = buscarUsuario(id);
        usuario.setRol(buscarRol(roleId));
        usuario.setFechaActualizacion(LocalDateTime.now());

        return toResponse(usuarioRepository.saveAndFlush(usuario));
    }

    @Override
    public void eliminarUsuario(Long id) {
        usuarioRepository.delete(buscarUsuario(id));
    }

    private Usuario buscarUsuario(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
    }

    private Rol buscarRol(Long roleId) {
        return rolRepository.findById(roleId)
                .orElseThrow(() -> new ResourceNotFoundException("Rol no encontrado"));
    }

    private UsuarioResponse toResponse(Usuario usuario) {
        return new UsuarioResponse(
                usuario.getId(),
                usuario.getNombre(),
                usuario.getApellido(),
                usuario.getCorreo(),
                usuario.getTelefono(),
                usuario.getDireccion(),
                usuario.getActivo(),
                usuario.getEntraId(),
                new RolResponse(
                        usuario.getRol().getId(),
                        usuario.getRol().getNombre()
                ),
                usuario.getFechaCreacion(),
                usuario.getFechaActualizacion()
        );
    }
}
