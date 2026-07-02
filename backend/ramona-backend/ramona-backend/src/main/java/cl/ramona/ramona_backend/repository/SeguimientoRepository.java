package cl.ramona.ramona_backend.repository;

import cl.ramona.ramona_backend.entity.Seguimiento;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SeguimientoRepository extends JpaRepository<Seguimiento, Long> {

    List<Seguimiento> findBySolicitudEnvioIdOrderByFechaEventoAsc(Long solicitudEnvioId);
}