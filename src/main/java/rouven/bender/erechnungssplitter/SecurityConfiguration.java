package rouven.bender.erechnungssplitter;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractAuthenticationFilterConfigurer;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.expression.WebExpressionAuthorizationManager;

@Configuration
public class SecurityConfiguration {
         
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
             http.authorizeHttpRequests(
                authorizationManagerRequestMatcherRegistry -> authorizationManagerRequestMatcherRegistry
                .requestMatchers("/*")
                    .access(new WebExpressionAuthorizationManager("hasIpAddress('::1') || hasIpAddress('127.0.0.1')")).anyRequest())
            .formLogin(AbstractAuthenticationFilterConfigurer::permitAll)
            .csrf(AbstractHttpConfigurer::disable);
        return http.build();
    }
     
    //@Bean
    //public WebSecurityCustomizer webSecurityCustomizer() { }
         
}