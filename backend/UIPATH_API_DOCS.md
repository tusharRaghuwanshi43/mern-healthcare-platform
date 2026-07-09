# UiPath Automation API Documentation

## Overview

Appointy integrates with UiPath RPA to automate appointment reminders and doctor schedule notifications. The MERN backend exposes secure APIs that UiPath workflows consume.

**Base URL:** `https://your-backend-url.com/api/automation`

---

## Authentication

All automation endpoints require the `x-uipath-api-key` header.

| Header | Value |
|--------|-------|
| `x-uipath-api-key` | Value of `UIPATH_AUTOMATION_API_KEY` from backend `.env` |

### Required Environment Variable

```
UIPATH_AUTOMATION_API_KEY=your_secret_value
```

Add this to the backend `.env` file. **Never** commit the actual value to GitHub.

---

## Endpoints

### 1. POST `/api/automation/appointment-created`

**Purpose:** Create an automation job after an appointment is booked.

**Request:**
```json
{
  "appointmentId": "667f1a2b3c4d5e6f7a8b9c0d"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Appointment automation job created",
  "appointment": {
    "appointmentId": "667f1a2b3c4d5e6f7a8b9c0d",
    "patientName": "Aarav Sharma",
    "patientEmail": "aarav.sharma@example.com",
    "doctorName": "Dr. Priya Mehta",
    "doctorEmail": "dr.priya.mehta@example.com",
    "speciality": "Cardiologist",
    "date": "Wednesday, 16 July 2026",
    "time": "10:00 AM",
    "paymentStatus": "Pending",
    "automationStatus": "queued"
  }
}
```

---

### 2. GET `/api/automation/upcoming-appointments`

**Purpose:** UiPath polls this to get appointments within the next N hours.

**Query Parameters:**

| Param | Type | Default | Range |
|-------|------|---------|-------|
| `hours` | number | 24 | 1-168 |

**Request:**
```
GET /api/automation/upcoming-appointments?hours=24
```

**Response (200):**
```json
{
  "success": true,
  "count": 2,
  "appointments": [
    {
      "appointmentId": "667f1a2b3c4d5e6f7a8b9c0d",
      "patientName": "Aarav Sharma",
      "patientEmail": "aarav.sharma@example.com",
      "doctorName": "Dr. Priya Mehta",
      "doctorEmail": "dr.priya.mehta@example.com",
      "speciality": "Cardiologist",
      "date": "Wednesday, 16 July 2026",
      "time": "10:00 AM",
      "paymentStatus": "Paid",
      "automationStatus": "queued"
    }
  ]
}
```

---

### 3. PATCH `/api/automation/:appointmentId/status`

**Purpose:** UiPath reports back the result of processing.

**Request:**
```json
{
  "status": "completed",
  "reminderSent": true,
  "doctorNotificationSent": true,
  "errorMessage": ""
}
```

**Valid `status` values:** `pending`, `queued`, `processing`, `completed`, `failed`

**Response (200):**
```json
{
  "success": true,
  "message": "Automation status updated",
  "automation": {
    "status": "completed",
    "reminderSent": true,
    "doctorNotificationSent": true,
    "lastProcessedAt": "2026-07-09T10:30:00.000Z",
    "errorMessage": ""
  }
}
```

---

### 4. POST `/api/automation/generate-reminder`

**Purpose:** Generate an AI-powered appointment reminder using Google Gemini.

**Request:**
```json
{
  "appointmentId": "667f1a2b3c4d5e6f7a8b9c0d"
}
```

**Response (200):**
```json
{
  "success": true,
  "subject": "Appointment Reminder",
  "message": "Dear Aarav, this is a friendly reminder for your upcoming appointment with Dr. Priya Mehta (Cardiologist) on Wednesday, 16 July 2026 at 10:00 AM. Please arrive 10 minutes early. For any changes, contact us through the Appointy platform."
}
```

---

## UiPath Workflow

```
1. UiPath calls GET /api/automation/upcoming-appointments?hours=24
2. UiPath loops through each appointment in the response
3. For each appointment:
   a. UiPath calls POST /api/automation/generate-reminder
      with { "appointmentId": "<id>" }
   b. UiPath sends the returned message via Gmail to patientEmail
   c. UiPath optionally sends doctor notification to doctorEmail
   d. UiPath calls PATCH /api/automation/<id>/status
      with { "status": "completed", "reminderSent": true, "doctorNotificationSent": true }
4. If any step fails:
   UiPath calls PATCH /api/automation/<id>/status
   with { "status": "failed", "errorMessage": "reason" }
```

---

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "message": "Description of the error"
}
```

| Status Code | Meaning |
|-------------|---------|
| 400 | Bad request / validation error |
| 401 | Missing or invalid API key |
| 404 | Appointment not found |
| 500 | Server error |
