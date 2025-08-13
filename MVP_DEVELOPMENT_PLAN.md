# Runweek: Project Development Plan & MVP Roadmap

This document outlines a plan for finalizing the frontend, developing the backend, and integrating both to deliver a Minimum Viable Product (MVP) for the Runweek application. It also includes strategies for testing, debugging, and deployment.

## 1. Current Project Status (Frontend)

Based on prior codebase analysis, the frontend has a solid foundation but relies on mocked data and behaviors for several key functionalities.

**1.1. Finalized / Well-Established Frontend Components & Structure:**
*   Core Application Setup: Vite, React Router DOM, main entry point (`src/main.tsx`), `App.tsx` structure.
*   Global State Management (Context API): `UserContext`, `ThemeContext`, `FloatingCoachContext`, `NotificationContext`, `PRContext`, `SearchContext` are set up, managing UI state and some `localStorage` persistence.
*   Routing System: Public and protected routes defined, smart redirection for login.
*   Layout Components: `Layout.tsx`, `Header.tsx`, `Sidebar.tsx`, `MobileNav.tsx`.
*   Reusable UI Components (`src/components/ui/`): `Badge`, `Card`, `LoadingScreen`, `Modal`, `ProgressBar`, `ThemePreview`.
*   Basic Page Structures (`src/pages/`): Most pages exist with defined routes and UI shells. `Settings.tsx` is comprehensive.

**1.2. Functionalities Currently in a Conceptual/Mocked State (Frontend):**
*   User Authentication (`UserContext`): Login uses hardcoded credentials; `changePassword` is mocked; Registration UI exists but no backend call.
*   Search Functionality (`SearchContext`): `performSearch` is mocked.
*   AI Coach (`FloatingCoachContext`): UI state managed, but no backend AI logic.
*   Notifications (`NotificationContext`): Initial notifications are mocked; no backend generation/fetching.
*   Data for Dashboard, Statistics, Goals, Achievements, Calendar: UI pages exist, but data is static from `sampleUser` or non-existent.
*   Billing Section in `Settings.tsx`: UI is static/mocked.

**1.3. Elements Clearly Needing Backend Implementation & Integration:**
*   User Management Backend: Secure registration, login, session management, password reset.
*   Data Persistence Backend: For User Profiles, Personal Records (beyond `localStorage`), User Activities/Workouts (major missing piece), Goals, Achievements, Calendar Events.
*   Search Backend: Actual search capability.
*   Coach AI Backend: (If part of MVP core, otherwise post-MVP).
*   Notification Service: Backend for generating/pushing notifications.
*   API Endpoints: For all CRUD operations.

## 2. MVP Scope & Definition

### 2.1. Frontend Finalization

**2.1.1. Essential Frontend Features for MVP:**
*   Authentication: Fully functional Registration, Login, Logout (all calling backend APIs). Secure auth token handling.
*   Core User Experience:
    *   Dashboard: Display key stats/recent activity (from backend).
    *   Activity Logging: Simple UI to log a new activity (date, distance, time).
    *   Activity Feed/List: Basic display of recent user activities (from backend).
    *   Personal Records: Display, Add, Edit, Delete PRs (all calling backend APIs).
*   User Profile & Basic Settings:
    *   Profile Page: Display basic user info (from backend).
    *   Settings Page: Update essential preferences (name, email, distance units), Password Change (all calling backend APIs).

**2.1.2. Tasks to Refine Existing UI/UX for MVP Features:**
*   Robust client-side validation & error feedback for Auth forms.
*   Refactor `UserContext` & other contexts to use real API calls, manage tokens & backend data/errors.
*   Implement loading states & empty states for data display components.
*   User-friendly forms for PRs & Activity Logging.
*   Consistent API error display.
*   Ensure MVP pages are responsive.
*   Remove all mocked data/behaviors for MVP features.

**2.1.3. Exclusions for MVP (Frontend):**
*   Advanced search.
*   Full AI Coach interactions.
*   Full Calendar functionality.
*   Achievements & detailed Goal tracking.
*   Non-essential Settings sections (advanced notifications, detailed privacy, social connections, billing).
*   In-app notification center (beyond toasts).
*   Full i18n.
*   Complex data visualizations.

**2.1.4. Estimated Effort for Frontend MVP Finalization (Placeholder):**
*   4-8 weeks (1-2 frontend developers).

### 2.2. Backend Development

**2.2.1. Core Backend Services/Modules for MVP:**
*   User Authentication Service (register, login, logout, password reset).
*   User Profile Management Service (CRUD for profile, change password).
*   Activity Logging Service (CRUD for user activities).
*   Personal Records (PRs) Service (CRUD for user PRs).
*   Dashboard Service (data aggregation for dashboard).

**2.2.2. Database Considerations:**
*   Recommendation: Relational DB like PostgreSQL.
*   Key Tables (Illustrative): `users`, `user_preferences`, `activities`, `personal_records`.

**2.2.3. API Endpoint Structure (Illustrative RESTful):**
*   `/auth/register`, `/auth/login`, etc.
*   `/users/me` (GET, PUT), `/users/me/password` (PUT)
*   `/activities` (POST, GET), `/activities/{activityId}` (GET, PUT, DELETE)
*   `/prs` (POST, GET), `/prs/{prId}` (PUT, DELETE)
*   `/dashboard` (GET)

**2.2.4. Technology Stack Considerations (Placeholder):**
*   Recommendation: Node.js (Express/NestJS) or Python (Django/Flask) for rapid MVP.
*   Authentication: JWT.

**2.2.5. Exclusions for Backend MVP:**
*   Admin interface, advanced analytics, real-time features, full social integrations, AI Coach logic, email/push notification infrastructure (beyond basic password reset emails).

**2.2.6. Estimated Effort for Backend MVP Development (Placeholder):**
*   6-10 weeks (1-2 backend developers).

## 3. Integration Plan (Frontend & Backend)

**3.1. Pre-requisites:**
*   Frontend MVP UI complete.
*   Backend MVP APIs developed, tested, deployed to staging.
*   API documentation available.
*   Clear error codes/response structures.

**3.2. Key Integration Tasks:**
*   Authentication Flow: Connect auth pages & `UserContext` to backend auth APIs. Handle tokens securely.
*   User Profile & Preferences: Connect Profile page and relevant Settings sections to user APIs.
*   Activity Logging & Display: Connect activity logging UI and display areas to activity APIs.
*   Personal Records (PRs): Refactor `PRContext` and PR page to use PR APIs, remove `localStorage`.
*   Dashboard Data: Connect Dashboard page to dashboard API.
*   Global Error Handling: Consistent strategy for API errors.
*   Environment Configuration: Manage API base URLs for different environments.

**3.3. Data Synchronization and State Management:**
*   Update client-side state after CUD operations.
*   Use `useEffect` for initial data fetching; consider React Query/SWR post-MVP.

**3.4. Collaboration & Communication:**
*   Regular FE/BE communication. Joint debugging. Shared API testing tools.

**3.5. Estimated Effort for Integration (Placeholder):**
*   3-5 weeks.

## 4. Testing Strategy

**4.1. Unit & Integration Tests:**
*   Frontend: Continue with Jest/React Testing Library for components, contexts, utilities. Mock API calls for service testing.
*   Backend: Unit tests for services/logic; Integration tests for API endpoints (request/response, DB interaction, auth).

**4.2. End-to-End (E2E) Testing (Optional for MVP):**
*   Consider for critical paths (auth, core data CUD) using Cypress/Playwright if resources allow.

**4.3. User Acceptance Testing (UAT):**
*   Participants: Internal team, then small group of real target users.
*   Methodology: Scenario-based testing, feedback collection.
*   UAT Phase 1: Core Functionality (~1 week):
    *   Focus: Registration, login, activity logging, PRs, dashboard, core navigation.
    *   Outcome: Identify critical bugs/usability issues.
*   UAT Phase 2: Broader MVP Scope & Polish (~1 week):
    *   Focus: Profile updates, settings, password management, error handling, consistency, responsiveness.
    *   Outcome: Identify remaining bugs, minor usability issues.

**4.4. Performance & Security Testing (Basic Checks for MVP):**
*   Basic checks for slow pages/APIs.
*   Backend code review for common vulnerabilities (SQLi, XSS, etc.). Secure password handling. HTTPS.

**4.5. Test Data Management:**
*   Prepare diverse test user profiles and data.

## 5. Debugging Phases

**5.1. Ongoing Debugging:** Part of development and integration testing.

**5.2. Dedicated Debugging Phases:**
*   Post-Integration Debugging (~1-2 weeks): Focus on FE/BE data flow, auth stability, critical bugs.
*   Post-UAT Phase 1 Debugging (~1 week): Address critical/major bugs and usability issues from UAT1.
*   Post-UAT Phase 2 Debugging & Pre-MVP Polish (~1 week): Final high-priority bug fixes, minor usability, UI polish.

**5.3. Bug Tracking and Management:** Use an issue tracker (Jira, GitHub Issues). Clear bug reporting format.

**5.4. Anticipating Complexity:** Authentication, data integrity, state management.

## 6. Deployment Strategy (Progressive Rollout for MVP)

**6.1. Environment Setup:**
*   Development: Local machines.
*   Staging/Testing: Mirrors production. For UAT and final tests.
*   Production: Live environment. Scaled, monitored, logged, backed up.

**6.2. Build & Deployment Automation (CI/CD):**
*   Source Control: Git (GitHub/GitLab).
*   CI: Automated tests, builds on commits/PRs.
*   CD: Automated deployment to Staging. Manual/Semi-automated deployment to Production for initial MVP.

**6.3. Initial MVP Deployment (Targeted Launch):**
*   Pre-Deployment Checklist: UAT feedback addressed, final regression testing, prod environment ready, monitoring/logging/backup/rollback plans in place.
*   Process: Deploy backend, then frontend. Smoke test production.
*   Initial User Access: Soft launch to a small group if possible.

**6.4. Monitoring, Logging, and Feedback Collection (Post-Launch):**
*   Monitoring: APM (Sentry, New Relic), Frontend Error Tracking (Sentry).
*   Logging: Structured backend logging.
*   User Feedback Channels: Clear channels for bug reports/feedback.

**6.5. Backup and Rollback Strategy:**
*   Regular automated DB backups. Test restoration.
*   Application versioning (Git tags, build artifacts).
*   Documented rollback procedure.

**6.6. Iterative Updates Post-MVP:**
*   Collect feedback, prioritize fixes and improvements. Plan for subsequent iterations (MVP v1.1, etc.).

**6.7. Estimated Timeline for Initial Deployment Setup & MVP Launch (Placeholder):**
*   Environment Setup: 1-2 weeks (can overlap).
*   CI/CD Basics: 1 week (can overlap).
*   Pre-Deployment & MVP Prod Deployment: 0.5-1 week.
*   Soft Launch/Initial Monitoring: 1-2 weeks.

## 7. Overall MVP Timeline (Illustrative Summary)

This timeline is a rough aggregation of the placeholder estimates and assumes some parallel work is possible.

*   Frontend MVP Finalization: 4-8 weeks
*   Backend MVP Development: 6-10 weeks
*   Integration Phase: 3-5 weeks (overlaps with end of FE/BE dev)
*   Testing (UAT Phases): 2 weeks (sequential, with debugging time in between)
*   Debugging (Dedicated Phases): 3-4 weeks (interspersed)
*   Deployment Setup & Launch Activities: 2-4 weeks (partially overlapping)

**Total Estimated Range for MVP: Roughly 3 to 6 months.** This depends heavily on team size, skill, finalized feature complexity, chosen tech stack, and issues found.

## 8. Conclusion

This document provides a strategic canvas for developing the Runweek MVP. Next steps:
*   Refine Requirements for MVP features.
*   Finalize Technology Stack choices.
*   Allocate Resources and plan sprints.
*   Initiate Development.

This roadmap is a living document and should be revisited and adjusted as the project progresses.
