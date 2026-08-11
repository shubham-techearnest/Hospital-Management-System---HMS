# DOC-59: Phase 1.5 — UI/UX Screen Specification

| Attribute | Value |
|-----------|-------|
| **Document ID** | DOC-59 |
| **Version** | 1.0 |
| **Status** | Approved |

---

## 1. Platform admin portal

### `/admin/hospitals` — Hospital list
| Element | Description |
|---------|-------------|
| Filters | Name, status |
| Table | Name, type, admin, doctor count, plan, status |
| Action | **Create hospital** button → dialog |
| Row link | → `/admin/hospitals/{id}` |

**Create hospital dialog fields:** name, registration #, type, plan code, admin email/name/phone.

**Status:** Implemented

### `/admin/hospitals/{id}` — Hospital detail
| Section | Content |
|---------|---------|
| Subscription | Current plan, doctor usage, change plan dropdown |
| Actions | Status chips, **Invite doctor** |
| History | Table of subscription events |

**Status:** Implemented

### `/admin/plans` — Plan catalog
| Element | Description |
|---------|-------------|
| Table | Plan name, code, price, max doctors, status |
| Action | Edit dialog (name, description, price, status) |

**Status:** Implemented

---

## 2. Hospital admin portal

### `/hospital/subscription`
| Element | Description |
|---------|-------------|
| Plan card | Name, description, price, status chip |
| Usage bars | Doctors, departments, branches, etc. |
| Warning | Shown when doctor usage at limit |
| Features | Chips for enabled/disabled features |

**Status:** Implemented

### `/hospital/doctors` — Doctor roster
| Element | Description |
|---------|-------------|
| Info alert | Doctors added by platform admin only |
| Table | Doctor name, reg #, specialization, status |
| Actions | Remove only (no invite/associate) |

**Status:** Implemented

### `/hospital/profile`
| State | UX |
|-------|-----|
| No hospital (404) | Info alert — contact platform admin |
| Has hospital | Edit form (no create) |

**Status:** Implemented

---

## 3. Public auth

### `/register`
| Element | Description |
|---------|-------------|
| Role | Patient only (no role selector) |
| Copy | Hospitals/doctors provisioned by administrators |

**Status:** Implemented (web + mobile)

---

## 4. Not yet implemented (mobile)

| Screen | Route | Priority |
|--------|-------|----------|
| Hospital subscription | `/hospital/subscription` | P1.5-S8 |
| Admin hospitals list | N/A (mobile admin TBD) | Low |

---

## 5. UX patterns

| Pattern | Application |
|---------|-------------|
| 409 conflict | Show server message (e.g. doctor limit reached) |
| 403 forbidden | Explain admin-only action |
| Usage at limit | Disable add actions; show upgrade message |
| Empty roster | "No doctors yet — contact platform admin" |

---

## 6. Navigation updates

**Admin portal nav:** Overview, **Hospitals**, **Plans**, Verifications, Users, Reviews, Settings

**Hospital portal nav:** … Doctor Roster, **Subscription**, Settings
