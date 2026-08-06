# Health360 Mobile Application — User Manual

This guide covers the Health360 **patient** mobile app built with React Native (Expo).

---

## 1. Getting started

### 1.1 Install and run (development)

See [docs/phase-1/mobile/MOBILE_SETUP.md](../docs/phase-1/mobile/MOBILE_SETUP.md) for environment setup.

1. Start the backend API (`localhost:8080`).
2. Start the mobile app with Expo.
3. Open the app on a device or emulator.

### 1.2 Create an account or sign in

1. On launch, the **Welcome** screen describes platform features for patients, doctors, and hospitals.
2. Tap **Sign in** or **Create an account** — dashboards, search, booking, and health records require authentication.
3. Enter email and password.
4. Complete email verification if required.
5. After login, you are routed to the portal for your role (patient, doctor, or hospital admin).

---

## 2. Main navigation

The bottom tab bar has five sections:

| Tab | Icon | Purpose |
|-----|------|---------|
| **Home** | Dashboard | Health dashboard, scores, trends, PDF export |
| **Find Doctor** | Doctor | Search doctors/hospitals with location & travel time |
| **Appointments** | Calendar | View, cancel, reschedule, and review visits |
| **Profile** | Heart | Health profile hub (incl. family & goals) |
| **Settings** | Cog | Account and notification settings |

**Doctor app (separate login):** Profile, Verification, Hospitals, Schedule, **Appointments**, Settings.

---

## 3. Home tab

The Home tab shows your patient dashboard.

- View **Wellness** and **Health Risk** scores with circular gauges.
- See **Key Metrics** (tap any card for metric detail and history).
- Track **Goals Progress** when health goals are set in Profile.
- View **Vitals Trends** sparklines and **Recent Activity** timeline.
- Tap **Export health report (PDF)** to download a summary (requires backend running).
- Quick actions: Profile, Vitals, **Lab Values**, **Health Documents**, **Health Timeline**, Find Doctor, Appointments.

### 3.1 Lab values (S14)

From Home → **Lab Values** (or quick action): record HbA1c, cholesterol, hemoglobin, and view history.

### 3.2 Health documents (S14)

From Home → **Health Documents**: upload PDF/JPEG/PNG reports (max 10 MB), filter by category, delete uploads.

### 3.3 Health timeline (S14–S15)

From Home → **Health Timeline**: browse health events and metric trend charts (BMI, weight, blood pressure).

---

## 4. Find Doctor tab

Use this tab to discover doctors and book consultations.

### 4.1 Search doctors

1. Tap the **Find Doctor** tab.
2. Browse the list of verified doctors shown by default.
3. Type in the search bar (name, specialty, hospital) and tap **Search**.
4. Use **Specialty** and **City** fields for additional filters.
5. Toggle **Available today** to see doctors with open slots today.
6. Tap **Use my location** when prompted — nearby results show distance and estimated drive time.
7. Tap **Find hospitals instead** to open hospital search (S12).

Each doctor card shows:

- Doctor name and specialty
- Hospital, branch, and city
- Distance, rating, and “Available today” when applicable

### 4.2 Find hospitals (S12)

1. From the doctor tab, tap **Find hospitals instead**.
2. Search by hospital name or filter by **Department**.
3. Toggle **24×7 Emergency** for emergency-ready facilities.
4. Review ICU and facility indicators on each hospital card.
5. Tap **View profile** to see branches on a map, departments, doctors, and reviews.

### 4.3 Public doctor profile (S13)

1. On a doctor card, tap **View profile**.
2. Review verification status, ratings, qualifications, hospital fees, and availability preview.
3. Tap **View hospital** on a practice location to open the hospital profile.
4. Tap **Book appointment** to continue to the booking flow.

### 4.4 Public hospital profile (S13)

1. From hospital search, tap **View profile** on a hospital card.
2. Review emergency/ICU badges, departments, and featured doctors.
3. Tap **Open in Google Maps** on any branch for directions.
4. Tap a doctor’s **View profile** to open their public doctor page.

### 4.5 Book an appointment

1. On a doctor card, tap **Book appointment**.
2. Select a **Hospital location** from the dropdown (shows hospital name, branch, and city).
3. Wait for **Available slots** to load.
4. Tap a time slot chip to select it.
5. Optionally enter a **Reason for visit**.
6. Tap **Confirm booking**.
7. A snackbar confirms success.

**Tip:** If you see “Invalid doctor link”, go back to **Find Doctor** and tap **Book appointment** from a search result — do not open booking with a malformed doctor ID.

### 4.6 When booking is unavailable

| Message | Meaning |
|---------|---------|
| No active hospital locations | Doctor is not verified or has no approved hospital association |
| No available slots | Doctor schedule has not been set for that location |
| Unable to load doctors | Check network and that the API server is running |

---

## 5. Appointments tab

Manage all your appointments from the dedicated tab.

### 5.1 View appointments

1. Tap the **Appointments** tab.
2. Use segment buttons: **Upcoming**, **Past**, or **Cancelled**.
3. Pull down to refresh the list.

### 5.2 Appointment details

1. Tap **View details** on an appointment card.
2. Review doctor name, date/time, hospital, branch, and status.
3. For **completed** appointments, tap **Leave a review** to rate the doctor or hospital (within 30 days).

### 5.3 Cancel or reschedule

From appointment details, use **Cancel** or **Reschedule** when those buttons are available.

### 5.4 Book when you have no appointments

If the list is empty, tap **Find a doctor** to go to the Find Doctor tab and start a new booking.

---

## 6. Profile tab

The **Health Profile** screen is your medical profile hub.

1. Tap the **Profile** tab.
2. Open sections such as personal information, medical history, allergies, emergency contacts, **family members**, and **health goals**.
3. Complete and save each section to improve profile completion.

---

## 7. Doctor mobile app (S15)

Sign in with a **doctor** account to access:

| Tab | Purpose |
|-----|---------|
| Profile | Professional details, biography, awards, memberships |
| Verification | Submit credentials |
| Hospitals | Hospital associations |
| Schedule | Weekly blocks + **block date ranges** when unavailable |
| Appointments | View patient appointments and **limited patient summary** during visit window |
| Settings | Account preferences |

---

## 8. Settings tab

### 8.1 Account settings

- Update account details.
- Change password.

### 8.2 Notification preferences

- Enable or disable email, SMS, and in-app notifications.
- Configure appointment reminders and confirmations.

---

## 9. Differences from the web app

| Feature | Web | Mobile |
|---------|-----|--------|
| Patient S14 features | Full | Lab values, documents, timeline, family, goals, reviews |
| Doctor appointments + patient summary | Full | Doctor tab supported |
| Hospital admin / Platform admin | Full | Web only |
| PDF health report | Dashboard export | Home tab export |

---

## 10. Troubleshooting

| Issue | What to do |
|-------|------------|
| Login fails | Verify API URL in app config and that backend is running |
| Empty doctor list | Ensure doctors are Verified with active hospital associations |
| Booking shows no slots | Ask doctor to configure schedule at the hospital (web doctor portal) |
| App cannot reach API | On a physical device, set `EXPO_PUBLIC_API_BASE_URL` to your PC LAN IP (e.g. `http://192.168.x.x:8080/api/v1`) |
| Location denied | Search still works; enter city manually or enable location in device settings |
| Session expired | Log out and log in again |

---

## 11. Test accounts (local development)

Use these with password `SecureP@ss1!` when testing against a seeded database:

| Role | Email | Mobile app |
|------|-------|------------|
| Patient | Register new account | Supported |
| Doctor | `siddharth.deshmukh@health360.test` | Doctor tabs incl. Appointments |
| Hospital admin | `hospital.admin@health360.test` | Use web app |

For booking tests, sign in as a **patient** on mobile, open **Find Doctor**, and book with a verified doctor such as Siddharth Deshmukh or Parmeshwar Suryawansh.
