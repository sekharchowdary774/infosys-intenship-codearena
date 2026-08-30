package com.codingplatform.coding_platform.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import lombok.RequiredArgsConstructor;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http) throws Exception {

        http
                .csrf(csrf -> csrf.disable())

                // =========================
                // CORS
                // =========================

                .cors(cors -> {})

                // =========================
                // STATELESS SESSION
                // =========================

                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                .authorizeHttpRequests(auth -> auth

                        // =========================
                        // CORS PREFLIGHT
                        // =========================

                        .requestMatchers(
                                HttpMethod.OPTIONS,
                                "/**"
                        ).permitAll()


                        // =========================
                        // AUTHENTICATION
                        // =========================

                        .requestMatchers(
                                "/api/auth/**"
                        ).permitAll()


                        // =========================
                        // SWAGGER
                        // =========================

                        .requestMatchers(
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/v3/api-docs/**"
                        ).permitAll()


                        // =========================
                        // PROBLEMS
                        // =========================

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/problems/**"
                        ).hasAnyRole("USER", "ADMIN")

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/problems"
                        ).hasRole("ADMIN")

                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/problems/**"
                        ).hasRole("ADMIN")

                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/api/problems/**"
                        ).hasRole("ADMIN")


                        // =========================
                        // TEST CASES
                        // =========================

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/test-cases/**"
                        ).hasAnyRole("USER", "ADMIN")

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/test-cases"
                        ).hasRole("ADMIN")

                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/test-cases/**"
                        ).hasRole("ADMIN")

                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/api/test-cases/**"
                        ).hasRole("ADMIN")


                        // =========================
                        // SUBMISSIONS
                        // =========================

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/submissions"
                        ).hasAnyRole("USER", "ADMIN")

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/submissions/my"
                        ).hasAnyRole("USER", "ADMIN")

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/submissions/**"
                        ).hasAnyRole("USER", "ADMIN")

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/submissions/admin"
                        ).hasRole("ADMIN")

                       // =========================
                       // ADMIN     DASHBOARD
                       // =========================

                                .requestMatchers(
                                        "/api/admin/**"
                                ).hasRole("ADMIN")


                         // =========================
                        // EVERYTHING ELSE
                        // =========================
                        .requestMatchers(
                                "/api/problems/{problemId}"
                        ).hasAnyRole("USER", "ADMIN")

                        .anyRequest().authenticated()
                )
//                .requestMatchers("/api/dashboard/**")
//                .authenticated()

                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }
}