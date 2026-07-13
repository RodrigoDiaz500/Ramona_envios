package cl.ramona.seguimientoservice.repository;

import cl.ramona.seguimientoservice.entity.Seguimiento;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SeguimientoRepository extends JpaRepository<Seguimiento, Long> {
    List<Seguimiento> findBySolicitudEnvioIdOrderByFechaEventoAsc(Long solicitudEnvioId);
}
