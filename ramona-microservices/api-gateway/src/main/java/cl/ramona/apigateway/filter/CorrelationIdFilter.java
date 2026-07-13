package cl.ramona.apigateway.filter;

import java.util.UUID;

import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;

import reactor.core.publisher.Mono;

@Component
public class CorrelationIdFilter implements GlobalFilter, Ordered {

    public static final String HEADER_NAME = "X-Correlation-Id";

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String existingCorrelationId = exchange.getRequest()
                .getHeaders()
                .getFirst(HEADER_NAME);

        final String correlationId =
                existingCorrelationId == null || existingCorrelationId.isBlank()
                        ? UUID.randomUUID().toString()
                        : existingCorrelationId;

        ServerHttpRequest modifiedRequest = exchange.getRequest()
                .mutate()
                .header(HEADER_NAME, correlationId)
                .build();

        ServerWebExchange modifiedExchange = exchange.mutate()
                .request(modifiedRequest)
                .build();

        modifiedExchange.getResponse()
                .getHeaders()
                .set(HEADER_NAME, correlationId);

        return chain.filter(modifiedExchange);
    }

    @Override
    public int getOrder() {
        return Ordered.HIGHEST_PRECEDENCE;
    }
}
