package cl.ramona.ramona_backend.repository;

import cl.ramona.ramona_backend.entity.Incidencia;
import cl.ramona.ramona_backend.enums.EstadoIncidencia;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface IncidenciaRepository extends JpaRepository<Incidencia, Long> {

    List<Incidencia> findByEstado(EstadoIncidencia estado);

    List<Incidencia> findBySolicitudEnvioId(Long solicitudEnvioId);

    List<Incidencia> findByCreadaPorId(Long usuarioId);

    List<Incidencia> findByAsignadaAId(Long usuarioId);

    long countByEstado(EstadoIncidencia estado);
}