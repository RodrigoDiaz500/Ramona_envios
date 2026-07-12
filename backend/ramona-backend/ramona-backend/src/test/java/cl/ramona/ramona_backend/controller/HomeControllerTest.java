package cl.ramona.ramona_backend.controller;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class HomeControllerTest {

    private HomeController homeController;

    @BeforeEach
    void setUp() {
        homeController = new HomeController();
    }

    @Test
    @DisplayName("Debe indicar que el backend está funcionando")
    void debeRetornarMensajeBackendFuncionando() {
        String response = homeController.test();

        assertThat(response)
                .isEqualTo("Backend funcionando");
    }
}