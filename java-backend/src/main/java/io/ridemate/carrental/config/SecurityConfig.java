package io.ridemate.carrental.config;

import io.ridemate.carrental.security.CustomUserDetailsService;
import io.ridemate.carrental.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.*;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.*;
import java.util.*;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final CustomUserDetailsService userDetailsService;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(CustomUserDetailsService userDetailsService,
                          JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.userDetailsService = userDetailsService;
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .headers(headers -> headers.frameOptions(frame -> frame.disable()))
            .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Public endpoints
                .requestMatchers("/api/v1/auth/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/cars/**", "/api/cars/**").permitAll()
                .requestMatchers("/api/health").permitAll()
                .requestMatchers("/h2-console/**").permitAll()
                // Coupons, Loyalty, MongoDB, Inventory & Documentation
                .requestMatchers("/api/v1/coupons/**", "/api/coupons/**").permitAll()
                .requestMatchers("/api/v1/inventory/**", "/api/inventory/**").permitAll()
                .requestMatchers("/api/v1/loyalty/**", "/api/loyalty/**").permitAll()
                .requestMatchers("/api/v1/mongo/**", "/api/mongo/**").permitAll()
                .requestMatchers("/swagger-ui/**", "/swagger-ui.html", "/v3/api-docs/**").permitAll()
                .requestMatchers("/actuator/**").permitAll()
                // Booking endpoints - permit creating & reading & downloading vouchers
                .requestMatchers("/api/v1/bookings/**", "/api/bookings/**").permitAll()
                // Tax & Policies: GET is public for booking calculation & vouchers, PUT is protected for ADMIN
                .requestMatchers(HttpMethod.GET, "/api/v1/tax-settings/**", "/api/tax-settings/**").permitAll()
                .requestMatchers(HttpMethod.PUT, "/api/v1/tax-settings/**", "/api/tax-settings/**").hasAnyRole("ADMIN", "OPERATIONS")
                .requestMatchers(HttpMethod.GET, "/api/v1/policies/**", "/api/policies/**").permitAll()
                .requestMatchers(HttpMethod.PUT, "/api/v1/policies/**", "/api/policies/**").hasAnyRole("ADMIN", "OPERATIONS")
                // Admin operations & management
                .requestMatchers(HttpMethod.POST, "/api/v1/cars", "/api/cars").hasAnyRole("ADMIN", "OPERATIONS")
                .requestMatchers(HttpMethod.PUT, "/api/v1/cars/**", "/api/cars/**").hasAnyRole("ADMIN", "OPERATIONS")
                .requestMatchers(HttpMethod.DELETE, "/api/v1/cars/**", "/api/cars/**").hasRole("ADMIN")
                .requestMatchers("/api/v1/operations/**").hasAnyRole("ADMIN", "OPERATIONS")
                .requestMatchers("/api/v1/admin/**", "/api/admin/**").hasAnyRole("ADMIN", "OPERATIONS")
                .requestMatchers("/api/v1/stats/**", "/api/stats/**").permitAll()
                .anyRequest().authenticated()
            );

        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(List.of("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
