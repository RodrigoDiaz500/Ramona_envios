package cl.ramona.sucursalservice.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI sucursalOpenAPI() {
        return new OpenAPI().info(new Info()
                .title("Ramona Sucursal Service")
                .version("1.0.0")
                .description("Microservicio de gestión de sucursales de Ramona Express."));
    }
}
