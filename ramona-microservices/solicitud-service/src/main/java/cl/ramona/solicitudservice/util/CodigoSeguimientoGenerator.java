package cl.ramona.solicitudservice.util;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.ThreadLocalRandom;

public final class CodigoSeguimientoGenerator {

    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("yyyyMMdd");

    private CodigoSeguimientoGenerator() {
    }

    public static String generar() {
        String fecha = LocalDateTime.now().format(DATE_FORMAT);
        int numero = ThreadLocalRandom.current().nextInt(1000, 10000);
        return "RAM-" + fecha + "-" + numero;
    }
}
