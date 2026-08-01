package com.codingplatform.coding_platform.jwt;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.function.Function;

@Service
public class JwtService {

    private static final String SECRET =
            "1234567890123456789012345678901234567890123456789012345678901234";

    private final SecretKey key = Keys.hmacShaKeyFor(SECRET.getBytes());

    public String generateToken(String email){

        return Jwts.builder()
                .subject(email)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis()+86400000))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public String extractEmail(String token){

        return extractClaim(token, Claims::getSubject);

    }

    public <T> T extractClaim(String token, Function<Claims,T> resolver){

        Claims claims = Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();

        return resolver.apply(claims);

    }

    public boolean isTokenValid(String token,String email){

        return extractEmail(token).equals(email)
                && !isTokenExpired(token);

    }

    private boolean isTokenExpired(String token){

        return extractClaim(token,Claims::getExpiration)
                .before(new Date());

    }

}