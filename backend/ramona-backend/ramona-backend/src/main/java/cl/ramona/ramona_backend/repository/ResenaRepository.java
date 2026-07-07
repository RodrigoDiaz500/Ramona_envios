package cl.ramona.ramona_backend.repository;

import cl.ramona.ramona_backend.entity.Resena;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;


import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface ResenaRepository extends JpaRepository<Resena, Long> {

    List<Resena> findByUsuarioId(Long usuarioId);

    Optional<Resena> findBySolicitudEnvioId(Long solicitudEnvioId);

    boolean existsBySolicitudEnvioId(Long solicitudEnvioId);

    @Query("SELECT COALESCE(AVG(r.calificacion), 0) FROM Resena r")
    BigDecimal promedioCalificacion();
}