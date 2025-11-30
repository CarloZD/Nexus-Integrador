package com.nexus.marketplace.service;


import com.nexus.marketplace.domain.AuditLog;
import com.nexus.marketplace.repository.AuditLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AuditService {

    @Autowired
    private AuditLogRepository auditLogRepository;

    public void log(Long userId, String action, String details, String ipAddress) {
        AuditLog log = AuditLog.builder()
                .userId(userId)
                .action(action)
                .details(details)
                .ipAddress(ipAddress)
                .build();

        auditLogRepository.save(log);
    }

    public void logLogin(Long userId, String ipAddress) {
        log(userId, "LOGIN", "Usuario inició sesión", ipAddress);
    }

    public void logLogout(Long userId, String ipAddress) {
        log(userId, "LOGOUT", "Usuario cerró sesión", ipAddress);
    }

    public void logRoleChange(Long adminUserId, Long targetUserId, String oldRole, String newRole, String ipAddress) {
        String details = String.format("Admin cambió rol de usuario %d de %s a %s", targetUserId, oldRole, newRole);
        log(adminUserId, "ROLE_CHANGE", details, ipAddress);
    }

    public void logUserDelete(Long adminUserId, Long targetUserId, String ipAddress) {
        String details = String.format("Admin eliminó usuario %d", targetUserId);
        log(adminUserId, "USER_DELETE", details, ipAddress);
    }
}
