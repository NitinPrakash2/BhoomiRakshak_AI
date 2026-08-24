# NER LANDSLIDE INTELLIGENCE

## AI-Based Early Warning & Landslide Risk Monitoring System for North Eastern Region

**SIH 2026 Problem Statement:** SIH26001
**Organization:** Ministry of Development of North Eastern Region (MDoNER)
**Theme:** Disaster Management
**Project Type:** Software / AI / GIS / Predictive Analytics

---

# 1. DOCUMENT PURPOSE

This document is the single source of truth for developing the project.

Any AI coding agent working on this project MUST read and understand this document before modifying the codebase.

The agent must NOT randomly change architecture, technologies, data flow, database structure, ML methodology, or UI direction without considering this specification.

The objective is to build a credible, explainable, scalable prototype that demonstrates:

DATA → ANALYSIS → AI RISK PREDICTION → GIS VISUALIZATION → ALERT → FIELD VERIFICATION → DECISION SUPPORT

The project must NOT be presented as a system capable of guaranteeing that a landslide will happen at an exact time.

The correct terminology is:

* Landslide risk estimation
* Landslide susceptibility
* Dynamic risk monitoring
* Early warning
* Risk forecasting
* Decision support

---

# 2. PROBLEM STATEMENT

The North Eastern Region of India is highly vulnerable to landslides because of:

* Heavy rainfall
* Steep terrain
* Fragile geological conditions
* Slope instability
* Hill cutting
* Road construction
* Soil saturation
* Extreme weather events

Landslides can:

* Block roads
* Isolate villages
* Damage infrastructure
* Disrupt transportation
* Delay emergency response
* Threaten lives and property

Existing monitoring can be reactive and fragmented.

The proposed platform should combine environmental, geographic, historical, satellite, sensor, and field-reporting information to estimate dynamic landslide risk and help authorities take preventive action.

---

# 3. CORE PROJECT VISION

The platform should answer five questions:

1. WHERE is the current risk?
2. WHY is the area risky?
3. HOW is the risk changing?
4. WHAT infrastructure or population may be affected?
5. WHAT action should authorities consider?

The system should transform raw environmental data into an understandable decision-support system.

---

# 4. CORE PRODUCT

The final product is a web-based disaster intelligence platform with optional mobile/PWA field reporting.

Main components:

1. Admin / Authority Dashboard
2. GIS Risk Map
3. AI/ML Prediction Engine
4. Weather and Rainfall Monitoring
5. Terrain and Slope Analysis
6. Historical Landslide Analysis
7. Satellite Analysis
8. Field/Citizen Reporting
9. Alert & Notification System
10. Emergency Prioritization
11. Analytics
12. Offline-capable field reporting
13. Multilingual notification support

---

# 5. HIGH-LEVEL SYSTEM FLOW

The complete system follows this architecture:

DATA SOURCES
↓
DATA INGESTION
↓
DATA VALIDATION
↓
DATA NORMALIZATION
↓
FEATURE ENGINEERING
↓
AI/ML RISK MODEL
↓
RISK SCORE
↓
RISK CLASSIFICATION
↓
GIS RISK MAP
↓
ALERT ENGINE
↓
AUTHORITY / FIELD OFFICER / COMMUNITY
↓
FIELD REPORT
↓
NEW EVIDENCE
↓
RISK REASSESSMENT

---

# 6. DATA SOURCES

The system should support multiple categories of data.

## 6.1 Rainfall / Weather

Possible inputs:

* Current rainfall
* Rainfall in previous 1 hour
* Rainfall in previous 6 hours
* Rainfall in previous 24 hours
* Rainfall in previous 72 hours
* Forecast rainfall
* Temperature
* Humidity
* Weather warnings

The system should preserve timestamp and geographic information.

Important:

Do not fabricate live weather data.

If an external API is unavailable during development, use clearly labelled historical/demo data.

---

# 7. SOIL MOISTURE

Potential input:

* Soil moisture percentage
* Soil saturation indicator
* Sensor ID
* Sensor location
* Timestamp

Example:

{
"sensorId": "SM-001",
"latitude": 27.XXXX,
"longitude": 88.XXXX,
"soilMoisture": 82,
"timestamp": "..."
}

Sensor data may initially be simulated for the prototype, but it must be clearly labelled as simulated/demo data unless connected to real sensors.

---

# 8. TERRAIN DATA

Important terrain features:

* Elevation
* Slope
* Aspect
* Terrain ruggedness
* Curvature where available
* Drainage characteristics
* Distance to roads
* Land cover
* Geological characteristics where available

Terrain information should be represented geographically.

---

# 9. HISTORICAL LANDSLIDE DATA

Historical records should contain, where available:

* Latitude
* Longitude
* Date
* District
* State
* Rainfall conditions
* Terrain information
* Landslide occurrence
* Severity
* Road impact
* Infrastructure impact

Historical data is essential for training and validating the ML model.

The system MUST NOT claim ML accuracy based only on synthetic random data.

If synthetic/demo data is used for demonstrating the interface, it must be explicitly labelled.

---

# 10. SATELLITE DATA

Satellite information can provide additional evidence.

Potential uses:

* Surface change detection
* Vegetation change
* Terrain disturbance
* Slope-area monitoring
* Land-cover analysis
* Post-event assessment

Satellite functionality should be implemented progressively.

MVP:

Display satellite-derived/static layers or prepared analysis.

Advanced:

Perform actual change detection.

The system must not pretend that an ordinary satellite image is automatically a landslide prediction.

---

# 11. GIS SYSTEM

GIS is a CORE component.

The application should have an interactive map.

Recommended frontend mapping technology:

* Leaflet
* OpenStreetMap-compatible basemap
* GeoJSON
* Optional MapLibre for advanced visualization

Map layers:

1. Risk Zones
2. District boundaries
3. Roads
4. Villages
5. Rivers
6. Sensors
7. Historical landslides
8. Field reports
9. Weather/rainfall overlays
10. Satellite layers

---

# 12. RISK MAP

Risk should be represented visually.

Suggested risk categories:

0–25 = LOW

26–50 = MODERATE

51–75 = HIGH

76–100 = VERY HIGH

These thresholds are initial product thresholds and MUST NOT be represented as scientifically universal thresholds.

They can later be calibrated using model validation and domain knowledge.

---

# 13. DYNAMIC RISK

Risk should change when environmental conditions change.

Example:

08:00

Risk Score: 42
Risk Level: MODERATE

12:00

Rainfall increases.

Risk Score: 63
Risk Level: HIGH

15:00

Rainfall + soil moisture increase.

Risk Score: 84
Risk Level: VERY HIGH

This dynamic change is one of the project's main differentiators.

---

# 14. AI/ML OBJECTIVE

The ML system should estimate the probability/risk of landslide occurrence or classify the area into risk categories.

The initial ML problem should be treated as a supervised classification problem if historical labelled landslide data is available.

Possible target:

landslide_occurrence = 0 or 1

OR:

risk_class = LOW / MODERATE / HIGH / VERY_HIGH

Preferred initial approach:

1. Train binary/multiclass model.
2. Produce probability.
3. Convert probability/model output into a normalized risk score.
4. Apply calibrated business thresholds for dashboard presentation.

Do NOT confuse model probability with guaranteed real-world probability.

---

# 15. RECOMMENDED ML MODEL

Initial model:

XGBoost Classifier

Alternative:

Random Forest

Baseline model:

Logistic Regression

The project should preferably compare at least two models during development.

Example:

Logistic Regression
vs
Random Forest
vs
XGBoost

Then select the model based on validation performance and interpretability.

XGBoost supports classification and probability outputs, and its feature-importance tooling can help explain which environmental variables contribute to predictions.

---

# 16. ML INPUT FEATURES

Potential features:

rainfall_1h
rainfall_6h
rainfall_24h
rainfall_72h

soil_moisture

elevation
slope
aspect
terrain_ruggedness

historical_landslide_count

distance_to_road
distance_to_river

land_cover

geological_risk_indicator

recent_surface_change

Additional features may be added only if reliable data exists.

The ML agent MUST NOT invent unsupported features.

---

# 17. ML PIPELINE

The ML pipeline should follow:

RAW DATA
↓
DATA CLEANING
↓
MISSING VALUE HANDLING
↓
OUTLIER CHECK
↓
FEATURE ENGINEERING
↓
TRAIN/VALIDATION/TEST SPLIT
↓
MODEL TRAINING
↓
HYPERPARAMETER TUNING
↓
MODEL EVALUATION
↓
MODEL SELECTION
↓
MODEL SERIALIZATION
↓
FASTAPI INFERENCE SERVICE

---

# 18. DATA LEAKAGE PREVENTION

This is extremely important.

The ML system MUST NOT use future information to predict the past.

The agent should check:

* Temporal leakage
* Duplicate locations
* Duplicate events
* Target leakage
* Incorrect train/test splitting

For time-dependent disaster data, a time-aware validation strategy should be considered.

The agent must explain why its chosen validation strategy is appropriate.

---

# 19. CLASS IMBALANCE

Landslide events may be much fewer than non-landslide observations.

The ML pipeline should check class distribution.

Potential techniques:

* class weights
* XGBoost scale_pos_weight
* controlled resampling
* appropriate evaluation metrics

Do not blindly oversample the data without validating whether it makes geographical/temporal sense.

---

# 20. ML EVALUATION

Do NOT report only accuracy.

Required metrics:

* Precision
* Recall
* F1 Score
* ROC-AUC where appropriate
* Confusion Matrix

For an early-warning use case, false negatives are particularly important because missing a genuinely dangerous event can be more consequential than generating an additional warning.

The system should therefore explicitly discuss the precision/recall trade-off.

---

# 21. EXPLAINABLE AI

Every high-risk prediction should explain WHY it is high-risk.

Example:

Risk Score: 87/100

Contributing factors:

Heavy 24h rainfall

* High soil moisture
* Steep slope
* Historical landslide activity
* Vulnerable road proximity

For tree models, feature importance and SHAP-based explanations may be used.

XGBoost provides multiple feature-importance approaches, while SHAP can be used when stronger local interpretability is required.

The UI should show:

WHY THIS AREA IS AT RISK

instead of only showing:

RISK = 87

---

# 22. AI/ML SERVICE ARCHITECTURE

The ML service should be separate from the Node.js backend.

Architecture:

React
↓
Node.js / Express
↓
FastAPI
↓
ML Model
↓
Prediction

Recommended:

Python
FastAPI
pandas
numpy
scikit-learn
xgboost
joblib
SHAP where appropriate

FastAPI provides a clean Python API layer for serving the ML model and automatically provides interactive API documentation.

---

# 23. PREDICTION API

Example endpoint:

POST /predict

Request:

{
"rainfall_24h": 142,
"rainfall_72h": 210,
"soil_moisture": 81,
"slope": 37,
"elevation": 1650,
"historical_landslide_count": 4,
"distance_to_road": 120
}

Response:

{
"riskScore": 87,
"riskLevel": "VERY_HIGH",
"modelProbability": 0.87,
"topFactors": [
"High 24h rainfall",
"High soil moisture",
"Steep slope"
],
"modelVersion": "xgb-v1"
}

The exact response schema should be finalized before frontend integration.

---

# 24. MERN BACKEND

Primary backend:

Node.js
Express.js
MongoDB
Mongoose

Responsibilities:

* Authentication
* User management
* Roles
* Risk zone APIs
* GIS data APIs
* Field reports
* Alerts
* Weather data storage
* Sensor data storage
* ML service communication
* Dashboard statistics
* Audit logs

---

# 25. USER ROLES

Minimum roles:

ADMIN
AUTHORITY
FIELD_OFFICER
CITIZEN

Permissions must differ by role.

ADMIN:

* Manage system
* Manage users
* View all regions
* Configure thresholds
* Manage data sources

AUTHORITY:

* Monitor risk
* View alerts
* Prioritize incidents
* Assign field teams
* Acknowledge alerts

FIELD_OFFICER:

* View assigned incidents
* Upload photos/videos
* Submit observations
* Update road status

CITIZEN:

* Submit geo-tagged reports
* View public warnings
* Receive relevant alerts

---

# 26. MONGODB COLLECTIONS

Recommended collections:

users
risk_zones
predictions
weather_data
sensor_data
landslide_records
field_reports
alerts
roads
villages
satellite_observations
notifications
audit_logs

---

# 27. RISK ZONE DOCUMENT

Conceptual schema:

{
name,
state,
district,

geometry: {
type: "Polygon",
coordinates: []
},

riskScore,
riskLevel,

rainfall,
soilMoisture,
slope,
elevation,

affectedRoads,
nearbyVillages,

lastUpdated,

modelVersion
}

Use GeoJSON and MongoDB geospatial indexing where appropriate.

---

# 28. FIELD REPORTING

Field/citizen reporting is a CORE requirement.

User flow:

Open Report
↓
Capture Photo/Video
↓
Get GPS Location
↓
Select Incident Type
↓
Add Description
↓
Submit
↓
Server
↓
Risk Zone Correlation
↓
Authority Dashboard

Incident types:

* Crack
* Slope movement
* Rockfall
* Mud/debris
* Road blockage
* Water overflow
* Other

---

# 29. IMAGE ANALYSIS

Image AI should be an advanced module.

Possible future model:

YOLO / computer vision model

Potential classes:

crack
debris
rockfall
road_blockage
slope_damage

IMPORTANT:

Image AI should provide supporting evidence, not claim that a photo alone proves an impending landslide.

Example:

Image Evidence:
"Possible slope crack detected"

Combined with:

Rainfall
+
Soil moisture
+
Slope
+
Historical risk

→ Overall risk assessment.

---

# 30. ALERT ENGINE

The alert engine should monitor risk conditions.

Example:

IF riskScore >= configured threshold
THEN create alert

Alert levels:

INFO
WATCH
WARNING
CRITICAL

Alert should include:

* Location
* Risk level
* Risk score
* Main contributing factors
* Time
* Nearby road
* Nearby village
* Recommended action
* Source of evidence

---

# 31. EMERGENCY PRIORITIZATION

Do not rank incidents only by AI risk.

Priority should consider:

Risk
+
Population exposure
+
Road importance
+
Infrastructure exposure
+
Connectivity
+
Confidence/evidence

Conceptual:

priorityScore =
risk
× exposure
× infrastructureImportance
× confidence

The exact formula must be documented and configurable.

---

# 32. ROAD CONNECTIVITY

The dashboard should show:

* Open
* At Risk
* Blocked
* Partially Blocked
* Unknown

Field officers can update road status.

Risk map should highlight critical routes.

---

# 33. DASHBOARD

Main dashboard should contain:

## Top statistics

Active Alerts
High Risk Zones
Very High Risk Zones
Blocked Roads
Field Reports
Sensors Online

## Main map

Large interactive GIS map.

## Risk trend

Risk over time.

## Weather

Rainfall and forecast.

## Alerts

Latest critical alerts.

## Priority queue

Incidents requiring action.

---

# 34. RISK ZONE DETAIL PAGE

When the user clicks a zone:

Show:

Zone name
District
Coordinates
Current risk score
Risk level
Risk trend
Rainfall
Soil moisture
Slope
Elevation
Historical landslides
Nearby roads
Nearby villages
Satellite evidence
Field reports
AI explanation
Recommended action
Last updated
Model version

---

# 35. OFFLINE FUNCTIONALITY

Remote NER areas may have poor connectivity.

Field reporting should support:

Offline report creation
Local storage
GPS capture
Photo metadata
Timestamp

When network returns:

LOCAL QUEUE
↓
SYNC ENGINE
↓
SERVER
↓
CONFIRMATION

Reports should have:

syncStatus:
pending
syncing
synced
failed

---

# 36. MULTILINGUAL SUPPORT

The application should support at least:

English
Hindi

Additional NER languages may be added based on feasibility and available translations.

Do not hard-code user-facing strings.

Use i18n.

Example:

t("alerts.veryHighRisk")

instead of:

"Very High Risk"

---

# 37. FRONTEND TECHNOLOGY

Primary:

React
Vite
Tailwind CSS
React Router
Axios

Recommended:

Leaflet
Recharts
Lucide Icons

Optional:

Framer Motion

Do not overuse animations.

The dashboard is a disaster-management tool, so clarity and performance are more important than decorative animation.

---

# 38. MOBILE STRATEGY

Preferred sequence:

PHASE 1:
Responsive React web application / PWA

PHASE 2:
React Native field application

This prevents unnecessary development overhead during the initial MVP.

---

# 39. PROJECT DIRECTORY

Recommended:

landslide-intelligence/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── layouts/
│   │   ├── maps/
│   │   ├── charts/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── context/
│   │   └── utils/
│   └── package.json
│
├── server/
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   ├── services/
│   ├── middleware/
│   ├── utils/
│   ├── config/
│   └── server.js
│
├── ml-service/
│   ├── data/
│   ├── notebooks/
│   ├── preprocessing/
│   ├── training/
│   ├── models/
│   ├── inference/
│   ├── evaluation/
│   ├── main.py
│   └── requirements.txt
│
├── shared/
│   └── schemas/
│
├── docs/
│
├── .env.example
├── README.md
└── docker-compose.yml

---

# 40. API STRUCTURE

Authentication:

POST /api/auth/register
POST /api/auth/login
GET /api/auth/me

Risk:

GET /api/risk/zones
GET /api/risk/zones/:id
GET /api/risk/heatmap
GET /api/risk/trends

Weather:

GET /api/weather
GET /api/weather/:location

Sensors:

GET /api/sensors
GET /api/sensors/:id
POST /api/sensors/data

Reports:

POST /api/reports
GET /api/reports
GET /api/reports/:id
PATCH /api/reports/:id/status

Alerts:

GET /api/alerts
POST /api/alerts
PATCH /api/alerts/:id/acknowledge

Roads:

GET /api/roads
PATCH /api/roads/:id/status

Dashboard:

GET /api/dashboard/summary

ML:

POST /api/ml/predict

---

# 41. SECURITY

Implement:

JWT authentication
Password hashing
Role-based access control
Input validation
Rate limiting
CORS configuration
Secure environment variables
File upload validation
File size limits
Audit logs

Never expose:

API keys
Database credentials
JWT secrets
Cloud storage secrets

Do not commit .env files.

---

# 42. FILE UPLOAD SECURITY

Field reports may contain photos/videos.

The server must validate:

File type
File size
Extension
MIME type

Do not trust only the filename extension.

Store uploads using a controlled storage system.

Do not execute uploaded files.

---

# 43. DATA QUALITY

Every data source should have:

source
timestamp
location
quality status

Example:

{
"source": "weather_api",
"timestamp": "...",
"latitude": 27.XXXX,
"longitude": 88.XXXX,
"quality": "valid"
}

The UI should show when data was last updated.

---

# 44. REAL DATA VS DEMO DATA

This is CRITICAL for SIH credibility.

The application must distinguish:

LIVE DATA
HISTORICAL DATA
SIMULATED DATA
DEMO DATA

Never present simulated values as real-world measurements.

Example badge:

DEMO SENSOR DATA

or:

HISTORICAL DATA

---

# 45. FAILURE HANDLING

External APIs may fail.

The application should:

* Show last successful update
* Show data source status
* Avoid crashing
* Use cached data where appropriate
* Display "Data unavailable" instead of fake data

Never silently replace missing real data with random values.

---

# 46. AI AGENT DEVELOPMENT RULES

Any coding agent working on this project must follow these rules:

1. Read this documentation first.
2. Do not rewrite the entire project unnecessarily.
3. Do not change the architecture without explaining why.
4. Do not introduce TypeScript if the project is intentionally JavaScript-based unless explicitly requested.
5. Keep MERN as the primary application stack.
6. Keep ML isolated in Python/FastAPI.
7. Do not fabricate scientific data.
8. Do not fabricate ML accuracy.
9. Do not fabricate API responses.
10. Clearly mark demo/synthetic data.
11. Write tests for critical functionality.
12. Validate all API inputs.
13. Keep secrets out of source code.
14. Maintain backward compatibility when modifying APIs.
15. Document significant architectural changes.

---

# 47. DEVELOPMENT PHASES

## PHASE 0 — Architecture

Before coding:

* Confirm folder structure
* Confirm database schemas
* Confirm API contracts
* Confirm frontend routes
* Confirm ML input/output schema
* Confirm data sources

No major coding until this is established.

---

# PHASE 1 — MERN FOUNDATION

Build:

React
Node
Express
MongoDB

Implement:

Authentication
Roles
Basic dashboard
API structure
Database models

---

# PHASE 2 — GIS

Build:

Interactive map
District boundaries
Risk zones
Roads
Villages
Historical landslide markers

Implement GeoJSON support.

---

# PHASE 3 — WEATHER

Integrate a reliable weather/rainfall source.

Store:

timestamp
location
rainfall
forecast
source

Display:

current conditions
rainfall trend
forecast
data freshness

---

# PHASE 4 — ML DATASET

Collect and clean historical data.

Create:

dataset.csv

Perform:

EDA
Missing-value analysis
Class distribution
Feature analysis
Correlation checks where appropriate

---

# PHASE 5 — ML MODEL

Train:

Baseline model
Random Forest
XGBoost

Evaluate:

Precision
Recall
F1
ROC-AUC
Confusion Matrix

Select model based on evidence.

Save:

model artifact
feature schema
model version
training metadata

---

# PHASE 6 — FASTAPI

Create:

POST /predict
GET /health
GET /model-info

Prediction response must contain:

risk score
risk level
probability if meaningful
top factors
model version
timestamp

---

# PHASE 7 — NODE + ML INTEGRATION

Node backend calls FastAPI.

Flow:

React
↓
Express
↓
FastAPI
↓
ML Model
↓
FastAPI Response
↓
Express
↓
React

The browser should not directly depend on internal ML service credentials.

---

# PHASE 8 — DYNAMIC RISK ENGINE

Combine:

ML prediction
Weather changes
Sensor data
Historical risk
Field evidence

Update risk zones.

Maintain prediction history.

---

# PHASE 9 — ALERTS

Implement:

Risk threshold detection
Alert generation
Alert acknowledgement
Alert history
Priority ranking

---

# PHASE 10 — FIELD REPORTING

Implement:

GPS
Photo
Description
Incident type
Offline queue
Sync

---

# PHASE 11 — ADVANCED AI

Optional:

Image analysis
Satellite change detection
SHAP explanations
Anomaly detection

Only implement if the core system is stable.

---

# 48. MVP DEFINITION

The MVP is considered complete when the following works end-to-end:

1. User logs in.
2. Dashboard opens.
3. GIS map displays NER risk zones.
4. Weather/rainfall data is available.
5. Historical data is loaded.
6. ML model produces a prediction.
7. Risk score is displayed.
8. Risk zone changes when input conditions change.
9. User can open a risk zone.
10. Dashboard explains major contributing factors.
11. Authority receives an alert.
12. Field officer can submit a report.
13. Report appears on the map.
14. System handles API failures gracefully.
15. Demo data is clearly labelled.

---

# 49. DEMO SCENARIO FOR SIH

The final demonstration should follow a story.

## Step 1

Open dashboard.

Show NER overview.

## Step 2

Select a high-risk zone.

Show:

Rainfall
Soil moisture
Slope
Historical events

## Step 3

Show AI risk:

Risk Score: 84
VERY HIGH

Show WHY.

## Step 4

Increase rainfall / use a prepared scenario.

Risk changes:

84 → 91

## Step 5

System generates alert.

## Step 6

Authority opens alert.

Shows affected road and nearby village.

## Step 7

Field officer uploads geo-tagged report.

Photo + GPS + description.

## Step 8

Report appears on GIS map.

## Step 9

System recalculates evidence/risk.

## Step 10

Dashboard recommends prioritizing the location.

This demonstrates the complete chain:

PREDICTION → ALERT → RESPONSE

---

# 50. WHAT NOT TO BUILD FIRST

Do NOT start with:

* Fancy animations
* Complex mobile app
* Blockchain
* Chatbot
* Huge microservice architecture
* Complex deep learning
* Real-time satellite processing
* Hardware sensors
* Dozens of APIs

First build:

MERN
+
GIS
+
Data
+
ML
+
Alerts

Then expand.

---

# 51. WHAT MAKES THIS PROJECT STRONG

The project should not be marketed as:

"An AI map."

It should be marketed as:

"An AI-assisted geospatial decision-support platform for dynamic landslide risk monitoring and early warning."

Key differentiators:

1. Dynamic risk
2. Explainable AI
3. GIS
4. Multi-source data fusion
5. Field verification
6. Emergency prioritization
7. Offline reporting
8. Multilingual alerts
9. Infrastructure-aware risk
10. Historical + real-time analysis

---

# 52. IMPORTANT SCIENTIFIC LIMITATIONS

The platform is a decision-support system.

It should NOT claim:

* Exact landslide time prediction
* Guaranteed landslide prediction
* 100% accuracy
* Complete geological certainty
* Official disaster warning authority

The system should instead provide:

* Risk estimates
* Early-warning indicators
* Risk trends
* Evidence
* Recommended prioritization
* Situational awareness

---

# 53. MODEL VERSIONING

Every prediction should record:

modelVersion
predictionTimestamp
featureVersion
dataSources

Example:

modelVersion:
xgb-v1.0

This allows future models to be compared.

---

# 54. OBSERVABILITY

The system should log:

API errors
ML prediction errors
Data ingestion failures
Authentication events
Alert creation
Alert acknowledgement
Field-report synchronization

Dashboard administrators should be able to see system health.

---

# 55. TESTING

Backend:

* Unit tests
* API tests
* Authentication tests
* Validation tests

Frontend:

* Component tests
* Critical user-flow tests

ML:

* Data validation
* Reproducibility
* Evaluation script
* Model input validation

Integration:

React → Express
Express → MongoDB
Express → FastAPI
FastAPI → Model

---

# 56. DEPLOYMENT

Recommended prototype deployment:

Frontend:
Vercel

Node backend:
Render / Railway / similar

ML service:
Render / Railway / containerized service

Database:
MongoDB Atlas

Object/file storage:
Cloud storage provider

For production-like deployment, Docker may be used.

---

# 57. ENVIRONMENT VARIABLES

Frontend:

VITE_API_URL

Backend:

PORT
MONGODB_URI
JWT_SECRET
ML_SERVICE_URL
WEATHER_API_KEY
STORAGE credentials

ML:

MODEL_PATH
ENVIRONMENT

All secrets must remain in environment variables.

---

# 58. AI AGENT WORKFLOW

The coding agent must work in this order:

UNDERSTAND
↓
PLAN
↓
IMPLEMENT
↓
TEST
↓
VERIFY
↓
DOCUMENT

Before implementing a feature, the agent should state:

1. What is being changed?
2. Why?
3. Which files will change?
4. Which APIs are affected?
5. What tests are required?
6. Are existing features affected?

---

# 59. AGENT PROMPTING RULE

Do not ask an AI agent:

"Build the whole project."

Instead give incremental tasks.

Example:

"Implement Phase 1 authentication according to MASTER_PROJECT_SPEC.md. Do not modify unrelated modules."

Then:

"Implement GIS risk map."

Then:

"Implement weather ingestion."

Then:

"Implement ML training pipeline."

Then:

"Integrate FastAPI prediction service."

This prevents the agent from generating an inconsistent codebase.

---

# 60. FIRST TASK FOR THE AI AGENT

The first instruction to the coding agent should be:

READ MASTER_PROJECT_SPEC.md COMPLETELY.

Do not write application code yet.

First:

1. Summarize the architecture.
2. Identify all modules.
3. Identify dependencies.
4. Propose database schemas.
5. Propose API contracts.
6. Propose frontend routes.
7. Propose ML service boundaries.
8. Identify missing data sources.
9. Identify technical risks.
10. Produce an implementation plan.

Wait for approval before large-scale implementation.

---

# 61. FINAL ARCHITECTURE

The target architecture is:

```
                ┌─────────────────────┐
                │     DATA SOURCES    │
                ├─────────────────────┤
                │ Weather / Rainfall  │
                │ Soil Moisture       │
                │ Terrain / DEM       │
                │ Historical Events   │
                │ Satellite           │
                │ Field Reports       │
                └──────────┬──────────┘
                           │
                           ▼
                ┌─────────────────────┐
                │ DATA INGESTION      │
                │ & VALIDATION        │
                └──────────┬──────────┘
                           │
                ┌──────────┴──────────┐
                ▼                     ▼
         ┌─────────────┐       ┌──────────────┐
         │ MongoDB     │       │ ML Pipeline  │
         │ Geo Data    │       │ Python       │
         └─────────────┘       └──────┬───────┘
                                      │
                                      ▼
                              ┌───────────────┐
                              │ XGBoost / ML  │
                              └───────┬───────┘
                                      │
                                      ▼
                              ┌───────────────┐
                              │ Risk Engine   │
                              └───────┬───────┘
                                      │
                    ┌─────────────────┼────────────────┐
                    ▼                 ▼                ▼
             ┌────────────┐    ┌────────────┐   ┌────────────┐
             │ GIS Map    │    │ Alert      │   │ Analytics  │
             └─────┬──────┘    └──────┬─────┘   └─────┬──────┘
                   │                  │               │
                   └──────────────────┼───────────────┘
                                      ▼
                              ┌───────────────┐
                              │ Node/Express  │
                              └───────┬───────┘
                                      │
                                      ▼
                              ┌───────────────┐
                              │ React Web App │
                              └───────┬───────┘
                                      │
                          ┌───────────┴───────────┐
                          ▼                       ▼
                   Authority Dashboard     Field/PWA App
```

---

# 62. FINAL TECHNOLOGY STACK

## Frontend

React
Vite
JavaScript
Tailwind CSS
React Router
Axios
Leaflet
Recharts
Lucide

## Backend

Node.js
Express.js
MongoDB
Mongoose
JWT

## AI/ML

Python
pandas
numpy
scikit-learn
XGBoost
SHAP
joblib

## ML API

FastAPI
Uvicorn

## GIS

GeoJSON
Leaflet
OpenStreetMap-compatible basemap
DEM / terrain datasets
Satellite data

## Notifications

Web Push / FCM
SMS provider where available

## Mobile/Offline

PWA initially
React Native later
IndexedDB / local storage / SQLite depending on implementation

## Deployment

Vercel
Render/Railway
MongoDB Atlas
Docker where useful

---

# 63. FINAL SUCCESS CRITERIA

The project succeeds when a judge can see:

REAL/VALID DATA
↓
AI ANALYSIS
↓
RISK SCORE
↓
GIS LOCATION
↓
EXPLANATION
↓
ALERT
↓
FIELD REPORT
↓
PRIORITIZED RESPONSE

The goal is not to create the most complicated AI model.

The goal is to create a believable, explainable, end-to-end disaster intelligence platform that directly addresses the SIH problem statement.

END OF MASTER PROJECT SPECIFICATION
