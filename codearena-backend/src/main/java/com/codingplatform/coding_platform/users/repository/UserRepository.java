package com.codingplatform.coding_platform.users.repository;

import java.time.LocalDateTime;
import java.util.Optional;

import com.codingplatform.coding_platform.common.Role;
import com.codingplatform.coding_platform.users.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Optional<User> findByUsername(String username);

    boolean existsByEmail(String email);

    boolean existsByUsername(String username);

    long countByCreatedAtBetween(
            LocalDateTime start,
            LocalDateTime end
    );
    long countByRole(Role role);
}