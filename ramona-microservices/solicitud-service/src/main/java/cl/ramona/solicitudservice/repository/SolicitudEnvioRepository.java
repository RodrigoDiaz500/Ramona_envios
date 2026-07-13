package cl.ramona.solicitudservice.repository;
import cl.ramona.solicitudservice.entity.SolicitudEnvio;
import cl.ramona.solicitudservice.enums.EstadoSolicitud;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface SolicitudEnvioRepository extends JpaRepository<SolicitudEnvio,Long> {
 Optional<SolicitudEnvio> findByCodigoSeguimiento(String codigoSeguimiento);
 List<SolicitudEnvio> findByUsuarioId(Long usuarioId);
 List<SolicitudEnvio> findByEstado(EstadoSolicitud estado);
 boolean existsByCodigoSeguimiento(String codigoSeguimiento);
 long countByEstado(EstadoSolicitud estado);
 long countByUsuarioId(Long usuarioId);
}
