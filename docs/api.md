# VirtuLab Kenya — API Documentation

Base URL: `https://your-server.railway.app/api`  
Local development: `http://localhost:3000/api`

All protected routes require the header:  
`Authorization: Bearer <token>`

---

## Health Check

`GET /api/health`  
No authentication required.  
Returns server status.

---

## Authentication

### Student Register
`POST /api/auth/student/register`
```json
{
  "name": "Amina Odhiambo",
  "email": "amina@school.ac.ke",
  "password": "securepassword",
  "form": "Form 3",
  "schoolCode": "NRB001"
}
```

### Student Login
`POST /api/auth/student/login`
```json
{ "email": "amina@school.ac.ke", "password": "securepassword" }
```
Returns: `{ token, user }`

### Teacher Login
`POST /api/auth/teacher/login`
```json
{ "email": "teacher@school.ac.ke", "password": "securepassword" }
```
Returns: `{ token, user }`

---

## Sessions

### Save Session (Student)
`POST /api/sessions` — requires student token
```json
{
  "titrationKey": "acidBase",
  "titrationTitle": "Acid-Base Titration",
  "indicatorLabel": "Phenolphthalein",
  "isSuitable": true,
  "trueConc": 0.0982,
  "studentAnswer": 0.0980,
  "correct": true,
  "trialsCount": 3,
  "concordantFound": true,
  "mode": "guided"
}
```

### Get My Sessions (Student)
`GET /api/sessions/mine` — requires student token

### Get Class Sessions (Teacher)
`GET /api/sessions/class` — requires teacher token  
Query params: `?class=Form3B&type=acidBase&from=2025-01-01`

---

## Assignments

### Create Assignment (Teacher)
`POST /api/assignments` — requires teacher token
```json
{
  "title": "Acid-Base Titration Practice",
  "titrationType": "acidBase",
  "instructions": "Complete two concordant titres by Friday.",
  "dueDate": "2025-03-15T23:59:00Z"
}
```

### Get My Assignments (Student)
`GET /api/assignments/mine` — requires student token
