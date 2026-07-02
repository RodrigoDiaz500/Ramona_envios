package cl.ramona.ramona_backend.repository;

import cl.ramona.ramona_backend.entity.Sucursal;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SucursalRepository extends JpaRepository<Sucursal, Long> {
}