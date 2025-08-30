1. Issue Categories & SLA Table

| Issue Category             | Priority | SLA Target (Hours) | Escalation Time (Hours) | Notes / Example                     |
| -------------------------- | -------- | ------------------ | ----------------------- | ----------------------------------- |
| Pothole                    | Low      | 72                 | 96                      | Minor patching needed               |
|                            | Medium   | 48                 | 60                      | Medium traffic impact               |
|                            | High     | 24                 | 36                      | Major roads / school area           |
|                            | Critical | 12                 | 18                      | Accident-prone zones                |
| Street Light Fault         | Low      | 96                 | 120                     | Residential areas                   |
|                            | Medium   | 72                 | 84                      | Main streets                        |
|                            | High     | 48                 | 60                      | Market / busier areas               |
|                            | Critical | 24                 | 30                      | Junctions / accident-prone areas    |
| Water Leak / Pipe Burst    | Low      | 48                 | 60                      | Minor leaks, residential            |
|                            | Medium   | 24                 | 36                      | Main line leaks                     |
|                            | High     | 12                 | 18                      | Commercial areas                    |
|                            | Critical | 6                  | 12                      | Major pipeline burst, road flooding |
| Traffic Signal Fault       | Low      | 48                 | 60                      | Off-peak times                      |
|                            | Medium   | 24                 | 30                      | Busy intersections                  |
|                            | High     | 12                 | 18                      | Accident-prone intersections        |
|                            | Critical | 6                  | 12                      | Junctions with heavy traffic        |
| Sidewalk / Footpath Damage | Low      | 72                 | 96                      | Minor cracks                        |
|                            | Medium   | 48                 | 60                      | Moderate damage, pedestrian risk    |
|                            | High     | 24                 | 36                      | Major pedestrian hazard             |
| Drainage / Clogging        | Low      | 48                 | 60                      | Minor blockage                      |
|                            | Medium   | 24                 | 36                      | Medium flooding risk                |
|                            | High     | 12                 | 18                      | Flood-prone areas                   |
| Debris / Fallen Tree       | Low      | 24                 | 36                      | Low impact                          |
|                            | Medium   | 12                 | 18                      | Moderate impact                     |
|                            | High     | 6                  | 12                      | High impact, road block             |
| Other                      | Low      | 72                 | 96                      | Minor / low-risk issues             |
|                            | Medium   | 48                 | 60                      | Moderate                            |
|                            | High     | 24                 | 36                      | High                                |
|                            | Critical | 12                 | 18                      | Emergency                           |

2. Priority Mapping

Low: Minor issue, low traffic impact, no immediate risk to public.

Medium: Moderate issue affecting traffic or safety, requires action within 1–2 days.

High: Major issue affecting public safety or traffic, must be addressed same day.

Critical: Emergency / hazard causing immediate risk to life/property, urgent attention required (<12 hours).

3. Workflow Diagram (Status Transitions)
[Pending] 
   │
   ▼ (assigned to field supervisor / contractor)
[In Progress] 
   │
   ▼ (work done / verification)
[Resolved] 
   │
   ▼ (verified by auditor / system automatically)
[Closed]

Additional Path:
[Pending] ──> [Escalated] ──> [In Progress / Manager Action]

Rules:
- Only City Engineer or Super Admin can move issues to Escalated.
- Field Supervisor can move Pending → In Progress → Resolved.
- Auditor can approve Resolved → Closed.

Visual Representation (simplified):
Pending ───► In Progress ───► Resolved ───► Closed
   │                          ▲
   │                          │
   └───────► Escalated ───────┘

4. Status Rules
| Status      | Who Can Change                | Required Fields / Actions                                | Notifications                           |
| ----------- | ----------------------------- | -------------------------------------------------------- | --------------------------------------- |
| Pending     | Super Admin, City Engineer    | Issue created, assign to field supervisor/contractor     | Notify assignee, reporter               |
| In Progress | Field Supervisor / Contractor | Add comments, upload photos, update progress             | Notify City Engineer                    |
| Resolved    | Field Supervisor / Contractor | Completion notes, images, resolution confirmation        | Notify City Engineer, Auditor, Reporter |
| Closed      | Auditor / Super Admin         | Verification & approval                                  | Notify all stakeholders                 |
| Escalated   | City Engineer / Super Admin   | Reason for escalation, assign to manager or senior staff | Notify assignee, supervisor, reporter   |

5. SLA Breach & Escalation Rules

Automatic SLA Tracking:

Track createdAt + SLA hours → if exceeded → mark as Escalated.

Notification Hierarchy:

12 hours before SLA → warning notification to assignee

SLA breached → Escalated, notify City Engineer, Super Admin

Escalated > 24 hours → higher-level notification (Super Admin + Department Head)

Dashboard Visualization:

Red highlight for Critical SLA breached issues

Orange for Near SLA breach

Green for within SLA


Roles & Access (as per your design)
| Role             | Description                         | Permissions                                                                                                   |
| ---------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Super Admin      | Full system control                 | Users: CRUD, Roles: CRUD, Issues: CRUD, Areas: CRUD, Analytics: View/Export, Settings: Modify                 |
| City Engineer    | Manage city-level operations        | Issues: CRUD, SLA monitoring, Escalations, Areas: View/Edit, Assignments: Create/Assign, Reports: View/Export |
| Field Supervisor | Handle field execution              | Issues: Read/Update assigned, Progress tracking, Upload images, Add comments, Mark Resolved                   |
| Auditor          | Compliance & performance monitoring | Issues: Read/Verify, Audit: Create/View, Reports: Generate/Export, Approve/Close Resolved                     |


Delhi NCR Area Data
1. Central Delhi (New Delhi District)

Geo Boundaries: Approximate coordinates for central Delhi areas.

Population: Approximately 1,173,902 (as per 2011 Census) .

Priority: High.

SLA Targets:

Potholes: 24 hours.

Street Lights: 48 hours.

Water Leaks: 24 hours.

Traffic Signals: 72 hours.

Sidewalks: 48 hours.

Drainage: 48 hours.

Debris: 24 hours.

Other Issues: 72 hours.

2. Ghaziabad District (Uttar Pradesh)

Geo Boundaries: Approximate coordinates for Ghaziabad areas.

Population: Approximately 3.1 million (as per 2021 projection) .

Priority: High.

SLA Targets:

Potholes: 24 hours.

Street Lights: 48 hours.

Water Leaks: 24 hours.

Traffic Signals: 72 hours.

Sidewalks: 48 hours.

Drainage: 48 hours.

Debris: 24 hours.

Other Issues: 72 hours.

3. Gurgaon District (Haryana)

Geo Boundaries: Approximate coordinates for Gurgaon areas.

Population: Approximately 1.5 million (as per 2011 Census).

Priority: Medium.

SLA Targets:

Potholes: 48 hours.

Street Lights: 72 hours.

Water Leaks: 48 hours.

Traffic Signals: 96 hours.

Sidewalks: 72 hours.

Drainage: 72 hours.

Debris: 48 hours.

Other Issues: 96 hours.

4. Faridabad District (Haryana)

Geo Boundaries: Approximate coordinates for Faridabad areas.

Population: Approximately 1.4 million (as per 2011 Census).

Priority: Medium.

SLA Targets:

Potholes: 48 hours.

Street Lights: 72 hours.

Water Leaks: 48 hours.

Traffic Signals: 96 hours.

Sidewalks: 72 hours.

Drainage: 72 hours.

Debris: 48 hours.

Other Issues: 96 hours.

🏙️ Rajkot Area Data
1. Rajkot Municipal Corporation (RMC) Area

Geo Boundaries: Approximate coordinates for Rajkot city areas.

Population: Approximately 1,323,363 (as per 2011 Census) .

Priority: High.

SLA Targets:

Potholes: 24 hours.

Street Lights: 48 hours.

Water Leaks: 24 hours.

Traffic Signals: 72 hours.

Sidewalks: 48 hours.

Drainage: 48 hours.

Debris: 24 hours.

Other Issues: 72 hours.

2. Rajkot Urban Development Authority (RUDA) Area

Geo Boundaries: Approximate coordinates for RUDA areas.

Population: Approximately 3,804,558 (as per 2011 Census) .

Priority: Medium.

SLA Targets:

Potholes: 48 hours.

Street Lights: 72 hours.

Water Leaks: 48 hours.

Traffic Signals: 96 hours.

Sidewalks: 72 hours.

Drainage: 72 hours.

Debris: 48 hours.

Other Issues: 96 hours.

Nearby Areas to Rajkot
1. Gondal

Geo Boundaries: Approximate coordinates for Gondal area.

Population: Approximately 1,50,000.

Priority: Medium.

SLA Targets:

Potholes: 48 hours.

Street Lights: 72 hours.

Water Leaks: 48 hours.

Traffic Signals: 96 hours.

Sidewalks: 72 hours.

Drainage: 72 hours.

Debris: 48 hours.

Other Issues: 96 hours.

2. Jetpur

Geo Boundaries: Approximate coordinates for Jetpur area.

Population: Approximately 1,20,000.

Priority: Low.

SLA Targets:

Potholes: 72 hours.

Street Lights: 96 hours.

Water Leaks: 72 hours.

Traffic Signals: 120 hours.

Sidewalks: 96 hours.

Drainage: 96 hours.

Debris: 72 hours.

Other Issues: 120 hours.

3. Upleta

Geo Boundaries: Approximate coordinates for Upleta area.

Population: Approximately 1,00,000.

Priority: Low.

SLA Targets:

Potholes: 72 hours.

Street Lights: 96 hours.

Water Leaks: 72 hours.

Traffic Signals: 120 hours.

Sidewalks: 96 hours.

Drainage: 96 hours.

Debris: 72 hours.

Other Issues: 120 hours.
| Category                          | Default Severity Levels | Description (Indian Context)                                                                                                        | Example Images / Notes                              |
| --------------------------------- | ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| **Potholes**                      | Low / Moderate / High   | Common in urban and semi-urban areas, worsens during monsoon. Can vary from small depressions to deep holes that damage vehicles.   | Photos: local roads in Delhi, Rajkot; monsoon-prone |
| **Cracks**                        | Low / Moderate / High   | Thermal and traffic-induced cracks. Often appear on asphalt roads in cities like Delhi and Gujarat due to heavy vehicle load.       | Hairline cracks vs long fissures                    |
| **Water Logging / Flooded Roads** | Low / Moderate / High   | Roads that accumulate water after rains. Typical in low-lying areas like parts of Delhi NCR and older city sections in Rajkot.      | Photos: standing water after monsoon                |
| **Damaged Sidewalks / Footpaths** | Low / Moderate / High   | Broken pedestrian paths, slabs missing, trip hazards. Common near markets, bus stops, and urban residential areas.                  | Cracked slabs, missing tiles                        |
| **Street Light Issues**           | Low / Moderate / High   | Street lamps not functioning or broken poles. Affects traffic safety at night in cities like Delhi, Noida, Rajkot.                  | Burnt-out bulbs, leaning poles                      |
| **Traffic Signal Malfunction**    | Low / Moderate / High   | Non-functioning traffic lights, blinking signals, or misaligned sensors. Affects intersections in high-traffic urban zones.         | Non-functional traffic lights                       |
| **Sidewalk / Road Debris**        | Low / Moderate / High   | Garbage, construction debris, or fallen tree branches blocking roads or pathways. Common near construction zones and local bazaars. | Broken bricks, litter piles                         |
| **Drainage Blockage**             | Low / Moderate / High   | Clogged storm drains causing water accumulation and road damage. Critical during monsoon in cities like Delhi and NCR regions.      | Stagnant water, blocked drains                      |
| **Traffic Sign Damage**           | Low / Moderate / High   | Missing, broken, or faded traffic signs affecting road safety. Seen in busy city intersections and highways in Gujarat & Delhi.     | Missing or faded signs                              |
| **Road Edge / Shoulder Damage**   | Low / Moderate / High   | Roads with crumbling edges, dangerous for two-wheelers and heavy vehicles. Common on older city roads and rural connections.        | Broken edges, exposed gravel                        |


Notifications System Design
1️⃣ Hierarchy of Notifications

Notifications are role-based and priority-sensitive:

Role	Notification Type	Purpose / Trigger
Citizen	Issue Created / Status Updated / Resolution	Keep citizens informed about their reported issues
Field Supervisor	New Assignment / SLA Warning / Escalation	Alerts about new tasks, pending deadlines, and critical issues
City Engineer	Escalation / High Severity Issues / Reports	Monitor SLA breaches, supervise field work, review critical area issues
Super Admin	System Health / SLA Breach / Department Alert	System-wide alerts, performance issues, compliance notifications
Auditor	Compliance Alerts / Reports Ready	Tracks compliance and audit-related notifications
2️⃣ Notification Templates

Each notification has a template with dynamic fields. Examples:

Citizen Notifications

Event	Template	Channels
Issue Created	“Your report [ISSUE_TITLE] has been received. Expected resolution by [SLA_DEADLINE].”	Push, Email, SMS
Status Updated	“Your report [ISSUE_TITLE] is now [STATUS]. Field supervisor: [SUPERVISOR_NAME].”	Push, Email
Resolution Confirmed	“Your reported issue [ISSUE_TITLE] has been resolved. Thank you for reporting.”	Push

Field Supervisor Notifications

Event	Template	Channels
New Assignment	“New issue assigned: [ISSUE_TITLE] in [AREA_NAME]. Priority: [PRIORITY].”	Push, Email
SLA Warning	“SLA approaching: [ISSUE_TITLE] must be resolved by [SLA_DEADLINE].”	Push, Email
Escalation	“Critical escalation: [ISSUE_TITLE] escalated to City Engineer. Take action immediately.”	Push

City Engineer Notifications

Event	Template	Channels
SLA Breach / Escalation	“[ISSUE_TITLE] in [AREA_NAME] breached SLA. Assigned to [SUPERVISOR_NAME].”	Push, Email
Area Performance Alert	“Resolution rate in [AREA_NAME] dropped below [THRESHOLD]%.”	Push, Email
Reports Ready	“[REPORT_NAME] is available for review.”	Email

Super Admin Notifications

Event	Template	Channels
System Health Alert	“Database/storage/network issue detected. Severity: [SEVERITY]. Immediate action required.”	Email, Push
SLA Breach / Compliance	“Department [DEPARTMENT_NAME] SLA compliance below [THRESHOLD]%.”	Email, Push
User Activity Anomaly	“Suspicious activity detected: [USER_NAME], [ACTION].”	Email

Auditor Notifications

Event	Template	Channels
Report Ready	“[REPORT_NAME] is ready for download.”	Email
Compliance Alert	“Audit discrepancy detected in [AREA_NAME] for period [PERIOD].”	Email, Push
3️⃣ Notification Channels
Channel	Description
Push	Real-time notifications in the citizen or authority apps. Use Firebase Cloud Messaging (FCM).
Email	Detailed notifications or reports. Useful for city engineers, super admins, auditors.


Note: Push notifications can include deep-links to dashboards or specific issue pages.

4️⃣ Escalation Rules

Purpose: Ensure SLA compliance and timely resolution of critical issues.

Trigger	Escalation Path	SLA Time Frame Example (Indian context)
SLA Deadline Approaching	Field Supervisor → City Engineer → Super Admin	High Priority: 24 hours → escalate every 4 hours remaining
Issue Not Updated	Field Supervisor → City Engineer	Medium Priority: 48 hours → escalate once daily
Critical Severity Issue	Field Supervisor → City Engineer → Super Admin → Auditor	Immediate push/SMS alert
Repeated SLA Breach	City Engineer → Super Admin	Automatic daily notification

Implementation Notes:

Escalation is automated in the Firestore Cloud Functions.

Each escalation triggers multi-channel notifications based on role and severity.

Notifications should include timestamp, issue link, and priority.

Auditors receive only summary or compliance-related notifications, not individual issue updates.

5️⃣ Firebase Implementation

Collection: notifications

Document Structure:

interface Notification {
  id: string;
  issueId?: string;
  recipientId: string;
  recipientRole: 'citizen' | 'field_supervisor' | 'city_engineer' | 'super_admin' | 'auditor';
  type: 'issue_created' | 'status_updated' | 'sla_warning' | 'escalation' | 'report_ready' | 'system_alert';
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  channels: ('push' | 'email' )[];
  isRead: boolean;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}


Cloud Functions monitor issues collection and generate notifications automatically:

On Create / Update: Notify citizen, supervisor.

On SLA Breach: Notify supervisor, engineer, admin.

On Escalation: Notify next level in hierarchy.

Analytics & Reporting System Design
1️⃣ Metrics / KPIs

We categorize metrics for roles and areas based on relevance:

Issue Management Metrics
Metric	Description	Target / Threshold (Indian context)
Total Issues Reported	Count of issues reported per area/district	N/A
Issues Resolved	Count of resolved issues in a time period	≥ 90% SLA compliance
Average Resolution Time	Mean time to resolve an issue	Minor: 24h, Moderate: 48h, Major: 72h
SLA Compliance	% of issues resolved within SLA deadline	≥ 95% per area
Escalated Issues	Count of issues escalated due to SLA breach	≤ 5%
Pending Issues	Count of open issues	N/A
Priority & Severity Metrics
Metric	Description	Threshold / Goal
High/Critical Issues	Count of high/critical severity issues	Monitored daily
Severity Distribution	Percentage of issues by severity (Minor/Moderate/Major/Critical)	Visualized in pie charts
Priority Distribution	% issues by priority (Low/Medium/High/Critical)	For SLA monitoring
Area / Geographic Metrics
Metric	Description	Notes
Active Issues by Zone	Count of currently active issues per neighborhood/zone	Heatmap representation
Resolution Rate by Area	% of issues resolved per area	Target ≥ 90%
Hotspot Analysis	Areas with repeated/clustered reports	Top 5 hotspots highlighted
User / Role Performance Metrics
Metric	Description	Target / Notes
Issues Assigned	Number of issues assigned to each field supervisor / contractor	Monitored weekly
Issues Completed	Number of issues completed by supervisor / contractor	≥ SLA compliance
Average Handling Time	Mean time taken by supervisor/engineer to update and resolve issues	Role-specific benchmarks
Feedback Score	Average citizen rating on resolved issues	≥ 4/5
2️⃣ Reporting Frequency
Report Type	Frequency	Audience	Notes
Daily Operations Report	Daily (auto-generated at 8 AM)	Field Supervisors, City Engineer	Summary of open/closed/overdue issues
SLA & Escalation Report	Weekly (Mon 9 AM)	City Engineer, Super Admin	SLA compliance, escalations
Area Performance Report	Monthly	City Engineer, Super Admin	Resolved issues, hotspot mapping
Audit & Compliance Report	Quarterly	Auditor, Super Admin	Department compliance and anomalies
Annual Summary Report	Yearly	Super Admin, Government Bodies	Full system performance & trends
3️⃣ Export Formats

The system will support multi-format exports:

Format	Use Case
CSV	Quick tabular analysis, import to Excel or BI tools
Excel (XLSX)	Detailed reports with formulas, pivot tables, charts
PDF	Official reports, audit submission, citizen-facing summaries
JSON	Integration with other apps or dashboards, programmatic access
Charts / Dashboards	Live interactive dashboards (Power BI / Google Data Studio style)

Example Exports per Role:

Field Supervisor: Daily task sheet (CSV/Excel), active assignments

City Engineer: Weekly SLA report (Excel/PDF), hotspot areas

Super Admin: Monthly/annual performance reports (PDF/Excel), system audit

Auditor: Quarterly compliance reports (PDF/Excel), anomaly logs

4️⃣ Dashboard Visualization Components

Performance Metrics Cards: SLA compliance %, Active vs Resolved issues

Time-Series Charts: Weekly / monthly trends in issue reporting & resolution

Heatmaps: Geographic distribution of issues, hotspots per area

Pie / Donut Charts: Severity and priority distribution

Leaderboards: Top-performing field supervisors and departments

Export Buttons: CSV / Excel / PDF download, auto-scheduled reports

5️⃣ Firebase Implementation

Collections: analytics_metrics, area_metrics, user_metrics

Data Example (Firestore Document):

interface AreaMetrics {
  areaId: string;
  period: DateRange;
  totalIssues: number;
  resolvedIssues: number;
  averageResolutionTime: number; // in hours
  slaCompliance: number; // percentage
  hotspots: GeoPoint[];
  severityBreakdown: Record<'minor'|'moderate'|'major'|'critical', number>;
  priorityBreakdown: Record<'low'|'medium'|'high'|'critical', number>;
}

interface UserMetrics {
  userId: string;
  period: DateRange;
  issuesAssigned: number;
  issuesResolved: number;
  averageResolutionTime: number;
  slaCompliance: number;
  feedbackScore: number; // 1-5
}

Maps & Routes Specification
1. API Integration

Google Maps API Key: Use a restricted key for web dashboard.

Services Used:

Maps JavaScript API → Interactive maps

Directions API → Route calculation

Places API → Auto-suggest locations for issue creation

Geocoding API → Convert addresses to coordinates for Firestore storage

Security: Restrict key to HTTP referrers (your domain) and enable usage logging.

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

2. Coordinates & GeoData

All issue locations, area boundaries, and user assignments are stored as GeoPoint objects in Firestore.

Example:

interface GeoPoint {
  latitude: number;
  longitude: number;
}

// Example issue location
const issueLocation: GeoPoint = { latitude: 28.6139, longitude: 77.2090 }; // Delhi


Areas: Boundaries defined as arrays of coordinates (polygons) for districts, zones, or neighborhoods.

interface Area {
  id: string;
  name: string;
  boundaries: GeoPoint[]; // Polygon coordinates
  priority: 'high' | 'medium' | 'low';
}

3. Heatmap Rules

Purpose: Show concentration of active or critical issues per area.

Data Source: issues collection with status and priority.

Color Coding (Municipal Theme):

Green → Low density / safe

Yellow → Medium density / in-progress

Red → High density / critical issues

const heatmapColors = [
  { density: 'low', color: '#16a34a' }, // Success green
  { density: 'medium', color: '#eab308' }, // Warning yellow
  { density: 'high', color: '#dc2626' }, // Danger red
];


Intensity Calculation: Weight by priority (critical > high > medium > low)

const heatmapWeight = (priority: string) => {
  switch (priority) {
    case 'critical': return 3;
    case 'high': return 2;
    case 'medium': return 1;
    default: return 0.5;
  }
};

4. Route Optimization Logic

Purpose: Provide field supervisors best paths for multiple assignments.

Data Input:

Supervisor’s current location

List of assigned issues (coordinates)

Road closures or hazards (optional)

Algorithm:

Google Directions API → Calculate shortest route with multiple waypoints.

Optional custom optimization: Solve Travelling Salesman Problem (TSP) for multiple issues in one zone.

Example:

const getOptimizedRoute = async (start: GeoPoint, stops: GeoPoint[]) => {
  const waypoints = stops.map(s => `${s.latitude},${s.longitude}`).join('|');
  const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${start.latitude},${start.longitude}&destination=${start.latitude},${start.longitude}&waypoints=optimize:true|${waypoints}&key=${GOOGLE_MAPS_API_KEY}`;
  // Fetch and parse JSON → return optimized order & polyline
};


Mobile Optimization: Field supervisors see the optimized route on map with touch-friendly markers and live updates.

5. Markers & Icons

Icons by Priority / Status:

Pending → 🟡 Yellow marker

In Progress → 🟠 Orange marker

Critical → 🔴 Red marker

Resolved → 🟢 Green marker

Clicking Marker: Opens IssueDetails card → option to update status, add photo, or navigate.

6. Real-Time Map Updates

Firestore snapshot listeners → update pins/heatmap dynamically as issues are created/updated/resolved.

This setup fully respects your design.md structure:

Roles → City Engineer & Field Supervisor will use this heavily.

SLA & workflow → Critical issues escalate, reflected on map heatmap.

Analytics → Maps integrate with hotspot analysis.

Mobile-first → Touch optimized with bottom navigation.