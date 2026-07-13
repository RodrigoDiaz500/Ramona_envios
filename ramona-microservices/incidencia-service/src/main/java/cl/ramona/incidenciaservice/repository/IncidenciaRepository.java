package cl.ramona.incidenciaservice.repository;
import cl.ramona.incidenciaservice.entity.Incidencia;
import cl.ramona.incidenciaservice.enums.EstadoIncidencia;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface IncidenciaRepository extends JpaRepository<Incidencia,Long>{
 List<Incidencia> findByEstado(EstadoIncidencia estado);
 List<Incidencia> findBySolicitudEnvioId(Long solicitudEnvioId);
 List<Incidencia> findByCreadaPorId(Long usuarioId);
 List<Incidencia> findByAsignadaAId(Long usuarioId);
 long countByEstado(EstadoIncidencia estado);
}
