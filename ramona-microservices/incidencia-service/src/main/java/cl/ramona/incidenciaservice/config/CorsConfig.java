package cl.ramona.incidenciaservice.config;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.*;
import org.springframework.web.servlet.config.annotation.*;
@Configuration public class CorsConfig implements WebMvcConfigurer {
 private final String origin; public CorsConfig(@Value("${app.cors.allowed-origin}") String origin){this.origin=origin;}
 @Override public void addCorsMappings(CorsRegistry registry){ registry.addMapping("/api/**").allowedOrigins(origin).allowedMethods("GET","POST","PUT","PATCH","DELETE","OPTIONS").allowedHeaders("*"); }
}
