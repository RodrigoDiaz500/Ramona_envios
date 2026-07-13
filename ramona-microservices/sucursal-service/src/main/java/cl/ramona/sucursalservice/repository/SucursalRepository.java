package cl.ramona.sucursalservice.repository;

import cl.ramona.sucursalservice.entity.Sucursal;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SucursalRepository extends JpaRepository<Sucursal, Long> {
}