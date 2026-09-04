Using the existing **Healthcare Platform design system, authentication experience, components, typography, colors and responsive patterns**, now build the complete **Patient / Normal User experience**.

IMPORTANT:

This is the **patient-facing application**, NOT the hospital staff application.

Do not redesign the existing foundation or authentication screens.

Do not use the Platform Admin or Hospital Admin sidebar.

Create a separate, modern patient experience while maintaining the same Healthcare Platform brand and design system.

The patient application should feel trustworthy, simple, friendly and premium while still being connected to the enterprise healthcare platform.

---

# 1. PATIENT APPLICATION CONTEXT

The normal user/patient is a public platform user.

Patients can:

* Register themselves
* Manage their profile
* Search healthcare providers
* Search hospitals
* Search doctors
* Book appointments
* Manage appointments
* View medical records
* View prescriptions
* View laboratory reports
* View radiology reports
* Manage insurance
* View bills/payments
* Receive notifications
* Manage consent and privacy
* Subscribe to paid healthcare services
* Access personalized health plans

Some functionality is FREE.

Some functionality requires a PAID subscription.

Clearly distinguish free and premium functionality.

---

# 2. PATIENT APPLICATION SHELL

Create a completely separate patient shell.

Desktop:

1440 × 900

Mobile:

390px

Use the existing:

* Inter typography
* Healthcare blue #1D4ED8
* Teal #0D9488
* Navy #0F172A
* Neutral palette
* Existing buttons
* Inputs
* Cards
* Badges
* Alerts
* Modals
* Drawers
* Tabs
* Tables
* Avatars
* Icons
* 4px spacing system
* 8px radius
* Accessible contrast

---

# 3. PATIENT HEADER

Create a clean patient-oriented header.

Left:

Healthcare Platform logo/name.

Center:

Global search:

"Search doctors, hospitals, specialties..."

Right:

* Location
* Notifications
* Help
* Patient avatar
* Patient name
* Profile dropdown

Profile dropdown:

* My Profile
* My Health
* Appointments
* Medical Records
* Insurance
* Payments
* Settings
* Logout

Do not show "Hospital Admin".

---

# 4. PATIENT NAVIGATION

Create patient navigation.

Desktop sidebar or modern navigation:

### HOME

* Dashboard

### CARE

* Find a Doctor
* Find a Hospital
* Appointments
* Medical Records
* Prescriptions
* Lab Reports
* Radiology

### HEALTH

* Health Dashboard
* Personalized Plans

### FINANCE

* Insurance
* Payments

### ACCOUNT

* Notifications
* Consent & Privacy
* Settings

Clearly mark premium features using a subtle:

"PRO"

or

"Premium"

badge.

---

# 5. PATIENT DASHBOARD

Create a high-fidelity patient dashboard.

Header:

"Good morning, [Patient Name]"

Subheading:

"Here's your health overview."

Top cards:

* Upcoming Appointment
* Active Prescriptions
* Pending Reports
* Insurance Status

Main sections:

### Upcoming Appointment

Show:

Doctor
Specialty
Hospital
Date
Time
Appointment type
Status

Actions:

* View Appointment
* Reschedule
* Cancel

### Quick Actions

Large accessible buttons:

* Book Appointment
* Find Doctor
* Find Hospital
* View Medical Records
* Upload Medical Document
* View Insurance

### Health Overview

Cards:

* Blood Pressure
* Heart Rate
* Weight
* Blood Glucose

Do not present fabricated medical values as actual patient data.

Use clearly marked demo/sample data where necessary.

### Recent Activity

Examples:

* Appointment booked
* Prescription added
* Lab report available
* Insurance updated

### Health Tasks

Examples:

* Complete profile
* Add insurance
* Upload medical history
* Review consent

---

# 6. FIND A DOCTOR

Create a complete doctor discovery experience.

Search:

"Search doctor, specialty or condition"

Filters:

* Specialty
* Location
* Hospital
* Gender
* Experience
* Availability
* Consultation type
* Language
* Rating

Doctor cards:

* Doctor photo/avatar
* Name
* Specialty
* Experience
* Hospital
* Location
* Available dates
* Consultation fee
* Rating
* Verification badge

Actions:

"View Profile"

"Book Appointment"

---

# 7. DOCTOR PROFILE

Create a premium doctor profile.

Sections:

* Profile
* About
* Specialization
* Experience
* Education
* Hospital affiliations
* Languages
* Consultation fee
* Available slots
* Reviews
* Location

Primary CTA:

"Book Appointment"

Show verified provider status clearly.

---

# 8. HOSPITAL DISCOVERY

Create:

"Find a Hospital"

Search and filters:

* Location
* Specialty
* Services
* Emergency
* Insurance accepted
* Rating
* Distance

Hospital cards should show:

* Hospital name
* Verification
* Location
* Departments
* Services
* Available doctors
* Insurance availability
* Contact
* Directions

CTA:

"View Hospital"

---

# 9. HOSPITAL PROFILE

Create hospital detail page.

Sections:

* Overview
* Departments
* Doctors
* Services
* Facilities
* Insurance
* Location
* Contact

CTA:

"Find Doctors"

"Book Appointment"

---

# 10. APPOINTMENT BOOKING FLOW

Create a complete multi-step appointment experience.

Step 1:

Select Doctor

Step 2:

Select Hospital

Step 3:

Select Date

Step 4:

Select Time

Step 5:

Appointment Details

Step 6:

Payment if required

Step 7:

Confirmation

Show a clear progress indicator.

Appointment types:

* In-person
* Other supported types should only appear if enabled by the platform/provider.

Do not implement virtual consultation as an active feature unless explicitly enabled later.

Confirmation screen:

"Appointment Confirmed"

Show:

* Doctor
* Hospital
* Date
* Time
* Appointment ID
* Location
* Payment status

Actions:

* Add to Calendar
* View Appointment
* Download Confirmation

---

# 11. APPOINTMENTS

Create appointment management.

Tabs:

* Upcoming
* Completed
* Cancelled

Appointment cards/table should show:

Doctor
Hospital
Date
Time
Status
Appointment type

Actions:

* View
* Reschedule
* Cancel

Use confirmation modal before cancellation.

---

# 12. MEDICAL RECORDS

Create a secure medical-record interface.

Categories:

* Visits
* Diagnoses
* Prescriptions
* Lab Reports
* Radiology
* Documents

Record cards:

* Date
* Provider
* Hospital
* Record type
* Status

Actions:

* View
* Download
* Share

Include privacy messaging.

Example:

"Your medical information is protected and shared only according to your consent and platform permissions."

---

# 13. PRESCRIPTIONS

Create prescription management.

Show:

* Doctor
* Hospital
* Prescription date
* Medicines
* Dosage
* Frequency
* Duration
* Instructions

Actions:

* View
* Download

Create medication cards with clear visual hierarchy.

---

# 14. LAB REPORTS

Create lab report dashboard.

Statuses:

* Ordered
* Processing
* Ready
* Reviewed

Report card:

Test name
Laboratory
Date
Status

Actions:

"View Report"

"Download"

---

# 15. RADIOLOGY

Create radiology reports section.

Show:

* Study type
* Facility
* Date
* Status
* Report availability

Actions:

* View Report
* Download Report

Do not imply access to actual imaging files unless the feature is explicitly supported.

---

# 16. INSURANCE

Create patient insurance management.

Dashboard:

* Active Policies
* Expiring Soon
* Claims
* Coverage

Insurance card:

* Provider
* Policy number
* Coverage
* Validity
* Status

Actions:

* View
* Edit
* Add Insurance

Include secure handling of insurance information.

---

# 17. PAYMENTS

Create patient payment experience.

Sections:

* Payment history
* Pending payments
* Receipts
* Subscriptions

Payment history:

* Date
* Provider
* Service
* Amount
* Status
* Receipt

Statuses:

* Paid
* Pending
* Failed
* Refunded

---

# 18. PREMIUM / SUBSCRIPTION EXPERIENCE

Create a dedicated premium experience.

Clearly explain that some patient features require a subscription.

Premium examples:

* Complete EMR access
* Advanced health dashboard
* Personalized health plans
* Personalized diet plans
* Personalized exercise plans

Create:

"Healthcare Platform Premium"

screen.

Include:

* Current plan
* Benefits
* Pricing
* Billing cycle
* Renewal
* Upgrade
* Cancel subscription

Do NOT make healthcare-critical basic access dependent on premium unnecessarily.

---

# 19. HEALTH DASHBOARD

Create a premium health dashboard.

Sections:

* Health summary
* Health trends
* Measurements
* Goals
* Health history

Charts:

* Weight trend
* Blood pressure trend
* Heart rate trend
* Glucose trend

Clearly distinguish:

"Patient-entered data"

from

"Provider-recorded data".

Never imply that sample data is real.

---

# 20. PERSONALIZED HEALTH PLANS

Create premium screens for:

### Personalized Health Plan

Sections:

* Current goals
* Recommended activities
* Nutrition
* Exercise
* Progress
* Recommendations

Create separate:

"Personalized Diet Plan"

and

"Personalized Exercise Plan"

screens.

Clearly label recommendations as personalized plans and provide appropriate medical disclaimers where necessary.

---

# 21. PROFILE

Create complete patient profile.

Sections:

### Personal Information

* Name
* Date of birth
* Contact
* Address

### Emergency Contact

### Healthcare Information

### Preferences

### Insurance

### Privacy

Allow editing through secure forms.

---

# 22. CONSENT & PRIVACY

Create a dedicated:

"Consent & Privacy"

screen.

Show:

* Data sharing consent
* Medical record sharing
* Provider access
* Insurance sharing
* Notifications
* Marketing preferences

Each permission should have:

* Current status
* Description
* Last updated
* Change action

Create consent confirmation modal.

Make consent history visible.

---

# 23. NOTIFICATIONS

Create notification center.

Categories:

* Appointments
* Medical Records
* Reports
* Payments
* Insurance
* Platform

Support:

* Read/unread
* Mark all read
* Notification preferences

---

# 24. PATIENT SETTINGS

Create:

* Account settings
* Security
* Password
* MFA
* Notification preferences
* Privacy
* Consent
* Language
* Accessibility
* Logout

---

# 25. PATIENT SECURITY STATES

Create complete screens for:

* Session expired
* Unauthorized
* Account locked
* Verification required
* Consent required
* Subscription required
* Feature unavailable
* Provider unavailable
* Appointment unavailable
* Payment failed

Use the existing authentication/status design language.

---

# 26. EMPTY / LOADING / ERROR STATES

Every patient module must have realistic states:

* Loading
* Skeleton
* Empty
* No appointments
* No medical records
* No insurance
* No prescriptions
* No lab reports
* No notifications
* Search no results
* Network error
* Permission denied

Do not use generic "Coming Soon" placeholders.

---

# 27. RESPONSIVE MOBILE EXPERIENCE

Create 390px mobile versions.

Mobile navigation should use a bottom navigation pattern:

Home
Appointments
Records
Health
Profile

Use a More menu for secondary features.

Make booking and important healthcare actions extremely easy to use on mobile.

---

# 28. ACCESSIBILITY

Follow accessible enterprise healthcare UX:

* Keyboard navigation
* Visible focus states
* Accessible contrast
* Clear labels
* Error messages
* Large touch targets
* Do not rely on color alone for status
* Screen-reader-friendly component structure

---

# 29. DATA & PRIVACY UX

Healthcare data is sensitive.

Use privacy-conscious UX throughout.

Never expose sensitive medical information unnecessarily in:

* notifications
* dashboard previews
* search
* public screens

Use masked/limited information where appropriate.

---

# 30. FINAL NAVIGATION FLOWS

Connect the screens into realistic prototype flows.

Flow 1:

Login
→ Patient Dashboard
→ Find Doctor
→ Doctor Profile
→ Select Date
→ Select Time
→ Appointment Confirmation

Flow 2:

Dashboard
→ Appointments
→ Appointment Details
→ Reschedule

Flow 3:

Dashboard
→ Medical Records
→ Record Details

Flow 4:

Dashboard
→ Lab Reports
→ Report Details

Flow 5:

Dashboard
→ Insurance
→ Add Insurance

Flow 6:

Dashboard
→ Health Dashboard
→ Premium Upgrade
→ Subscription

Flow 7:

Dashboard
→ Profile
→ Privacy & Consent

---

# CRITICAL REQUIREMENT

Keep the patient experience completely separate from:

* Platform Admin
* Organization Admin
* Hospital Staff
* Doctor
* Nurse
* Receptionist

A patient should NEVER see administrative navigation.

A patient should NEVER see hospital operational modules such as:

OPD
IPD
ICU
Nursing
OT
Pharmacy Operations
Inventory Management
Staff Management
Hospital Administration

Those belong to provider/hospital applications.

The patient application is the **consumer-facing healthcare experience connected to the provider ecosystem**.

Build this as a polished, production-ready healthcare product rather than a collection of generic dashboard screens.

Reuse the existing Healthcare Platform foundation everywhere.
