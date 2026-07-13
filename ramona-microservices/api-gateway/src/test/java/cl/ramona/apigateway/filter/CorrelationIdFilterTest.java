package cl.ramona.apigateway.filter;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.concurrent.atomic.AtomicReference;

import org.junit.jupiter.api.Test;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.mock.http.server.reactive.MockServerHttpRequest;
import org.springframework.mock.web.server.MockServerWebExchange;
import org.springframework.web.server.ServerWebExchange;

import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

class CorrelationIdFilterTest {

    private final CorrelationIdFilter filter = new CorrelationIdFilter();

    @Test
    void debeConservarCorrelationIdExistente() {
        MockServerWebExchange exchange = MockServerWebExchange.from(
                MockServerHttpRequest.get("/api/usuarios")
                        .header(CorrelationIdFilter.HEADER_NAME, "ramona-123")
                        .build());

        AtomicReference<ServerWebExchange> captured = new AtomicReference<>();
        GatewayFilterChain chain = current -> {
            captured.set(current);
            return Mono.empty();
        };

        StepVerifier.create(filter.filter(exchange, chain)).verifyComplete();

        assertThat(captured.get().getRequest().getHeaders()
                .getFirst(CorrelationIdFilter.HEADER_NAME)).isEqualTo("ramona-123");
        assertThat(exchange.getResponse().getHeaders()
                .getFirst(CorrelationIdFilter.HEADER_NAME)).isEqualTo("ramona-123");
    }

    @Test
    void debeGenerarCorrelationIdCuandoNoExiste() {
        MockServerWebExchange exchange = MockServerWebExchange.from(
                MockServerHttpRequest.get("/api/solicitudes").build());

        AtomicReference<ServerWebExchange> captured = new AtomicReference<>();
        GatewayFilterChain chain = current -> {
            captured.set(current);
            return Mono.empty();
        };

        StepVerifier.create(filter.filter(exchange, chain)).verifyComplete();

        String generated = captured.get().getRequest().getHeaders()
                .getFirst(CorrelationIdFilter.HEADER_NAME);

        assertThat(generated).isNotBlank();
        assertThat(exchange.getResponse().getHeaders()
                .getFirst(CorrelationIdFilter.HEADER_NAME)).isEqualTo(generated);
    }

    @Test
    void debeEjecutarseConPrioridadAlta() {
        assertThat(filter.getOrder()).isEqualTo(Integer.MIN_VALUE);
    }
}
