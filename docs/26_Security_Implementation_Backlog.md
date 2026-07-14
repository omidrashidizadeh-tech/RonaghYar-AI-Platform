# Security Implementation Backlog

Version: 1.0  
Priority: Critical

## Sprint 1.3
- Replace browser localStorage token storage with secure HttpOnly cookie sessions.
- Refresh-token rotation and session revocation.
- Workspace-aware RBAC and deny-by-default authorization.
- Redis rate limits for authentication, generation and Compare mode.
- Security headers, strict CORS and CSRF protection.
- Audit log for login, role, plan and AI provider changes.
- Startup validation for weak JWT secrets and missing production secrets.

## Before Beta
- Email verification, reset-password workflow and MFA.
- SAST, dependency, secret and container scanning in CI.
- Tenant-isolation integration tests.
- Prompt-injection and unsafe-tool threat models.
- Encrypted backup plus restore drill.
