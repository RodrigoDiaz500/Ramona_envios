package cl.ramona.ramona_backend.service.impl;

import cl.ramona.ramona_backend.dto.request.UsuarioRequest;
import cl.ramona.ramona_backend.dto.response.RolResponse;
import cl.ramona.ramona_backend.dto.response.UsuarioResponse;
import cl.ramona.ramona_backend.entity.Rol;
import cl.ramona.ramona_backend.entity.Usuario;
import cl.ramona.ramona_backend.exception.ResourceNotFoundException;
import cl.ramona.ramona_backend.repository.RolRepository;
import cl.ramona.ramona_backend.repository.UsuarioRepository;
import cl.ramona.ramona_backend.service.UsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UsuarioServiceImpl implements UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;

    @Override
    public List<UsuarioResponse> listarUsuarios() {
        return usuarioRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public UsuarioResponse obtenerUsuarioPorId(Long id) {
        Usuario usuario = buscarUsuario(id);
        return toResponse(usuario);
    }

    public UsuarioResponse cambiarRolUsuario(Long id, Long roleId) {
    Usuario usuario = buscarUsuario(id);

    Rol rol = rolRepository.findById(roleId)
            .orElseThrow(() -> new ResourceNotFoundException("Rol no encontrado"));

    usuario.setRol(rol);

    return toResponse(usuarioRepository.save(usuario));
}

    @Override
    public UsuarioResponse crearUsuario(UsuarioRequest request) {
        if (usuarioRepository.existsByCorreo(request.correo())) {
            throw new IllegalArgumentException("Ya existe un usuario con ese correo");
        }

        Rol rol = rolRepository.findById(request.roleId())
                .orElseThrow(() -> new ResourceNotFoundException("Rol no encontrado"));

        Usuario usuario = Usuario.builder()
                .nombre(request.nombre())
                .apellido(request.apellido())
                .correo(request.correo())
                .telefono(request.telefono())
                .direccion(request.direccion())
                .entraId(request.entraId())
                .activo(true)
                .rol(rol)
                .build();

        return toResponse(usuarioRepository.save(usuario));
    }

    @Override
    public UsuarioResponse actualizarUsuario(Long id, UsuarioRequest request) {
        Usuario usuario = buscarUsuario(id);

        Rol rol = rolRepository.findById(request.roleId())
                .orElseThrow(() -> new ResourceNotFoundException("Rol no encontrado"));

        usuario.setNombre(request.nombre());
        usuario.setApellido(request.apellido());
        usuario.setCorreo(request.correo());
        usuario.setTelefono(request.telefono());
        usuario.setDireccion(request.direccion());
        usuario.setEntraId(request.entraId());
        usuario.setRol(rol);

        return toResponse(usuarioRepository.save(usuario));
    }

    @Override
    public UsuarioResponse cambiarEstadoUsuario(Long id, Boolean activo) {
        Usuario usuario = buscarUsuario(id);
        usuario.setActivo(activo);
        return toResponse(usuarioRepository.save(usuario));
    }

    @Override
    public void eliminarUsuario(Long id) {
        Usuario usuario = buscarUsuario(id);
        usuarioRepository.delete(usuario);
    }

    private Usuario buscarUsuario(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
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
