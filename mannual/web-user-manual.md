# Health360 Web Application — User Manual

This guide explains how to use the Health360 web application at `http://localhost:5173` (local development) or your deployed URL.

---

## 1. Getting started

### 1.1 Home page (before sign in)

The home page (`/`) describes Health360 capabilities for **patients**, **doctors**, and **hospitals**. It does not show personal health data. Use **Sign in** or **Create account** to access your role-specific portal.

### 1.2 Create an account

1. Open the Health360 website.
2. Click **Register**.
3. Choose your role: **Patient**, **Doctor**, or **Hospital Admin**.
4. Fill in your name, email, phone, and password.
5. Submit the form and verify your email if prompted.
6. Sign in from the **Login** page.

### 1.3 Sign in

1. Go to **Login**.
2. Enter your email and password.
3. After login, you are redirected to the portal for your role.

---

## 2. Patient portal

After login as a patient, you land on the **Dashboard**.

### 2.1 Navigation

| Menu item | Purpose |
|-----------|---------|
| Dashboard | Health overview and quick actions |
| Search | Unified search for doctors and hospitals |
| Find a Doctor | Advanced doctor filters (rating, fee, nearest) |
| Find a Hospital | Hospital search with department and facility filters |
| Health Profile | Personal, medical, family, goals, and emergency details |
| Vitals | Blood pressure and health metrics |
| Lab Values | Record HbA1c, cholesterol, and other lab results |
| Health Documents | Upload lab reports, prescriptions, and scans |
| Health Timeline | Chronological view of health events |
| Appointments | View upcoming, past, and cancelled appointments |
| Settings | Account and notification preferences |

### 2.2 Unified search (S12)

1. Open **Search** from the sidebar.
2. Enter a query (doctor name, hospital, specialty, or city).
3. Tap **Use my location** to sort and filter by distance (within 25 km).
4. Switch tabs: **All**, **Doctors**, or **Hospitals**.
5. Use **Advanced doctor filters** or **Advanced hospital filters** for more options.

### 2.3 Find a doctor

1. Open **Find a Doctor** from the sidebar.
2. Browse the default list of verified doctors, or use the search box to filter by name, specialty, or hospital.
3. Optional filters: city, language, minimum rating, maximum fee, available today.
4. Click **Use my location** and sort by **Nearest** for distance-based results.
5. Each doctor card shows specialty, hospital, city, distance, fee, and availability.
6. Click **View profile** or **Book appointment** on a doctor card.

### 2.4 Find a hospital (S12)

1. Open **Find a Hospital** from the sidebar.
2. Search by hospital name or filter by department.
3. Toggle **24×7 Emergency** or **ICU available** as needed.
4. Use **Use my location** to see hospitals sorted by distance.
5. Results show facilities, ratings, and distance in km.
6. Click **View profile** to open the hospital’s public profile with map and doctors.

### 2.5 Public doctor profile (S13)

Guest and patient users can view verified doctor profiles **without signing in** at `/doctors/{doctorId}`.

1. From search results, click **View profile** on a doctor card.
2. The profile shows verification badge, rating, biography, qualifications, hospitals & fees, availability preview, and paginated reviews.
3. Click a hospital name to open its public profile.
4. Click **Book appointment** — if you are not signed in, you are prompted to log in first.

### 2.6 Public hospital profile (S13)

Open `/hospitals/{hospitalId}` from hospital search or from a doctor profile.

1. View hospital description, emergency/ICU badges, and ratings.
2. See branch locations on an **interactive map** (Google Maps when `VITE_GOOGLE_MAPS_API_KEY` is set; OpenStreetMap fallback otherwise).
3. Browse departments and featured doctors; click **View profile** on any doctor.
4. Read paginated patient reviews at the bottom of the page.

### 2.7 Book an appointment

1. From **Find a Doctor**, click **Book appointment** on a doctor card.
   - Always open booking from search; do not paste arbitrary URLs.
2. On the booking page:
   - Select a **Hospital location** (doctor must have an active association).
   - Choose an **Available slot** from the list.
   - Optionally enter a **Reason for visit**.
3. Click **Confirm booking**.
4. A confirmation message appears when the appointment is created.

**Tip:** If you see “Invalid doctor link”, go back to **Find a Doctor** and select the doctor again from search results.

### 2.4 Manage appointments

1. Open **Appointments** from the sidebar.
2. Switch tabs: **Upcoming**, **Past**, or **Cancelled**.
3. Click an appointment to view details.
4. Cancel or reschedule when those actions are available on the detail page.
5. For **completed** appointments, click **Leave a review** to rate the doctor or hospital (within 30 days of the visit).

### 2.5 Health dashboard and analytics

1. Open **Dashboard** from the sidebar.
2. Review your **Wellness Score** and **Health Risk Score** gauges.
3. Browse the **Key Metrics** grid (BMI, BMR, blood pressure, blood sugar, calories, water, steps, sleep).
4. Tap any metric card to open **Metric Detail** with interpretation, reference range, and trend history (when you have 2+ readings).
5. Check **Goals Progress** if you set health goals in your profile.
6. View **Vitals Trends** sparklines and **Recent Activity** timeline.
7. Open **View all metrics** for the full analytics page grouped by body, lifestyle, and vitals.

### 2.6 Health profile

1. Open **Health Profile**.
2. Complete sections such as personal info, medical history, allergies, emergency contacts, **family members**, and **health goals**.
3. Save each section. A completion indicator shows how complete your profile is.

### 2.7 Lab values (S14)

1. Open **Lab Values** from the sidebar.
2. Enter one or more lab results (HbA1c, LDL, HDL, total cholesterol, hemoglobin) and the recorded date.
3. Click **Save lab values**. History appears below for past entries.

### 2.8 Health documents (S14)

1. Open **Health Documents** from the sidebar.
2. Choose a file (PDF, JPEG, or PNG, max 10 MB), category, and title.
3. Click **Upload**. Use the filter to browse by category.
4. Download or delete documents from the list.

### 2.9 Health timeline (S14)

1. Open **Health Timeline** from the sidebar.
2. Browse events such as vitals recorded, lab values, document uploads, and reviews submitted.
3. Review **Metric trends** charts for BMI, weight, and blood pressure classification (S15).

### 2.10 Health report PDF (S15)

1. On the **Dashboard**, click **Export health report (PDF)** to download a summary of your health metrics and profile data.

### 2.11 Settings

- **Account settings:** Change password and update contact details.
- **Notification preferences:** Choose email, SMS, and in-app alerts for appointments and reminders.

---

## 3. Doctor portal

Doctors manage their professional profile, verification, hospital links, and schedule.

### 3.1 Navigation

| Menu item | Purpose |
|-----------|---------|
| Dashboard | Overview of profile status and appointments |
| Professional Profile | Qualifications, experience, biography, fees |
| Verification | Submit documents for platform review |
| Hospital Associations | Link to hospitals and request associations |
| Schedule | Set weekly availability at each hospital |
| Appointments | View and manage patient appointments |
| Settings | Account and notifications |

### 3.2 Complete your profile

1. Open **Professional Profile**.
2. Fill in registration number, council, specialization, biography, and languages.
3. Add qualifications and experience entries.
4. Set default consultation fees and duration.
5. Save each section.

### 3.3 Submit for verification

1. Open **Verification**.
2. Upload required documents (registration certificate, ID proof, etc.).
3. Click **Submit for review**.
4. Status changes to **Pending verification** until a platform admin approves.

**Note:** Doctors appear in the admin verification queue only after **Submit for review**. Draft profiles are not queued.

### 3.4 Hospital association

1. Open **Hospital Associations**.
2. Search for a hospital (e.g. Health360 Hospital).
3. Request association with a branch and department.
4. The association starts as **Pending** until the hospital admin approves it.
5. Only **Active** associations allow patients to book at that location.

### 3.5 Set your schedule

1. Open **Schedule**.
2. Choose hospital and branch.
3. Add weekly time blocks (e.g. Mon–Sat, 9:00–12:00 and 14:00–17:00).
4. Save. Available appointment slots are generated automatically.
5. Use **Block dates** to mark leave or unavailability for a date range (Block / Unblock).

### 3.6 Appointments

1. Open **Appointments**.
2. View upcoming and past consultations.
3. Open an appointment for details and status updates.
4. When within 24 hours of the visit, a **Patient Health Summary** shows allergies, medications, conditions, vitals, labs, and goals.

### 3.7 Profile enrichment (S15)

1. On **Professional Profile**, expand **Biography** to write your public bio.
2. Add **Awards** and **Professional Memberships** in their accordion sections.
3. These appear on your public doctor profile once verified.

---

## 4. Hospital admin portal

Hospital admins manage the hospital profile, branches, departments, emergency info, and doctor roster.

### 4.1 Navigation

| Menu item | Purpose |
|-----------|---------|
| Dashboard | Hospital overview |
| Hospital Profile | Name, accreditation, beds, description |
| Branches | Locations, addresses, working hours |
| Departments | Clinical departments and heads |
| Emergency | 24x7 emergency phone, ambulance, ICU |
| Facilities | Diagnostic, surgical, and other facility listings (S15) |
| Gallery | Upload hospital photos for the public profile (S15) |
| Doctors | Approve or manage doctor associations |
| Settings | Account and notifications |

### 4.2 Complete hospital profile

1. Open **Hospital Profile** and fill all required fields.
2. Add or edit **Branches** with address, phone, and working hours.
3. Create **Departments** (e.g. General Medicine, Cardiology).
4. Configure **Emergency** contact number and ambulance/ICU availability.
5. Add **Facilities** (e.g. ICU, diagnostic lab, pharmacy) and upload photos under **Gallery**.

### 4.3 Approve doctors

1. Open **Doctors**.
2. Review pending association requests.
3. Click **Approve** to activate a doctor at your hospital.
4. Only approved (Active) doctors appear in patient search and booking for your location.

---

## 5. Platform admin portal

Platform admins verify doctors, manage users, and moderate reviews.

### 5.1 Doctor verification queue

1. Open **Verifications**.
2. Review doctors with status **Pending verification** (submitted by the doctor).
3. Open a doctor to review profile and documents.
4. **Approve** to mark as Verified, or **Reject** with a reason.

Verified doctors appear in patient **Find a Doctor** search and can receive bookings where they have active hospital associations and schedules.

### 5.2 User management (S14)

1. Open **Users** from the sidebar.
2. Search by email, name, role, or status.
3. Use **Set DEACTIVATED** or **Set LOCKED** to restrict an account; **Set ACTIVE** to restore access.

### 5.3 Review moderation (S14)

1. Open **Review Moderation**.
2. Browse visible doctor and hospital reviews.
3. Click **Moderate** on a review, choose **Hide** or **Remove**, and enter a reason.
4. Switch the status filter to **Hidden** to see moderated reviews.

---

## 6. Troubleshooting

| Issue | What to do |
|-------|------------|
| “Invalid doctor link” when booking | Go to **Find a Doctor** and book from a doctor card |
| No hospital locations when booking | Doctor must be Verified with an Active hospital association |
| No available slots | Doctor or hospital admin must configure a schedule |
| Doctor not in admin queue | Doctor must click **Submit for review** on Verification page |
| Association stuck on Pending | Hospital admin must approve on **Doctors** page |
| 500 errors on appointments/search | Ensure backend is running and database migrations are up to date |

---

## 7. Quick reference — local dev URLs

| Page | URL path |
|------|----------|
| Login | `/login` |
| Patient dashboard | `/patient/dashboard` |
| Find a doctor | `/patient/book` |
| Book appointment | `/patient/book/{doctorId}` |
| My appointments | `/patient/appointments` |
| Doctor profile | `/doctor/profile` |
| Hospital doctors | `/hospital/doctors` |
| Hospital facilities | `/hospital/facilities` |
| Hospital gallery | `/hospital/gallery` |
| Admin verifications | `/admin/verifications` |
