package cl.ramona.ramona_backend.repository;

import cl.ramona.ramona_backend.entity.SolicitudEnvio;
import cl.ramona.ramona_backend.enums.EstadoSolicitud;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SolicitudEnvioRepository extends JpaRepository<SolicitudEnvio, Long> {

    Optional<SolicitudEnvio> findByCodigoSeguimiento(String codigoSeguimiento);

    List<SolicitudEnvio> findByUsuarioId(Long usuarioId);

    List<SolicitudEnvio> findByEstado(EstadoSolicitud estado);

    boolean existsByCodigoSeguimiento(String codigoSeguimiento);

    long countByEstado(EstadoSolicitud estado);

    long countByUsuarioId(Long usuarioId);
}