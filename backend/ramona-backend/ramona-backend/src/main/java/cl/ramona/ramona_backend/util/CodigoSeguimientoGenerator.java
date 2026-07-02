package cl.ramona.ramona_backend.util;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Random;

public class CodigoSeguimientoGenerator {

    private static final Random RANDOM = new Random();

    private CodigoSeguimientoGenerator() {
    }

    public static String generar() {
        String fecha = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        int numero = RANDOM.nextInt(9000) + 1000;

        return "RAM-" + fecha + "-" + numero;
    }
}