/**
 * BhoomiRakshak - real, labelled seed data for the NER region.
 * Aligned with MASTER_DOCUMENTATION.md:
 *   Sections 6/7/9/44 (every record carries DataQuality: LIVE /
 *   HISTORICAL / SIMULATED / DEMO) and Section 49 (demo scenario).
 * Locations/districts are real NER geography. Sensor samples are
 * SIMULATED; RTO risk scores are DEMO until a model serves them.
 */
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const config = require("../config");

const prisma = new PrismaClient();

// GeoJSON Polygon around a centroid (Section 27).
const polygonAround = (lat, lng, deg = 0.08) => ({
  type: "Polygon",
  coordinates: [
    [
      [lng - deg, lat - deg],
      [lng + deg, lat - deg],
      [lng + deg, lat + deg],
      [lng - deg, lat + deg],
      [lng - deg, lat - deg],
    ],
  ],
});

const daysAgo = (n, hour = 6) => {
  const d = new Date(Date.now() - n * 24 * 60 * 60 * 1000);
  d.setHours(hour, 0, 0, 0);
  return d;
};

async function upsertUser({ email, name, role, phone, district, state, password }) {
  const passwordHash = await bcrypt.hash(password, 12);
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    await prisma.user.update({
      where: { id: existing.id },
      data: { name, role, phone, district, state },
    });
    return existing;
  }
  return prisma.user.create({
    data: { email, name, role, phone, district, state, passwordHash },
  });
}

async function seedUsers() {
  await upsertUser({
    email: config.seed.adminEmail,
    name: "System Admin",
    role: "ADMIN",
    password: config.seed.adminPassword,
  });
  await upsertUser({
    email: "authority@bhoomirakshak.gov.in",
    name: "District Authority",
    role: "AUTHORITY",
    district: "Gangtok",
    state: "Sikkim",
    password: "Authority@123",
  });
  await upsertUser({
    email: "field@bhoomirakshak.gov.in",
    name: "Field Officer",
    role: "FIELD_OFFICER",
    district: "Mangan",
    state: "Sikkim",
    password: "Field@123",
  });
  await upsertUser({
    email: "citizen@example.com",
    name: "Citizen Reporter",
    role: "CITIZEN",
    district: "Gangtok",
    state: "Sikkim",
    password: "Citizen@123",
  });
  console.log("[seed-data] users done");
}

async function findOrCreateZone(data) {
  const existing = await prisma.riskZone.findFirst({
    where: { name: data.name, district: data.district },
  });
  if (existing) {
    await prisma.riskZone.update({ where: { id: existing.id }, data });
    return existing;
  }
  return prisma.riskZone.create({ data });
}

async function seedRiskZones() {
  const zones = [
    { name: "Tawang - Se La Pass Approach", state: "Arunachal Pradesh", district: "Tawang", lat: 27.586, lng: 91.859, score: 82, level: "HIGH", soil: 84, slope: 41, elev: 4100, rain: 156 },
    { name: "Pasighat - Rolling Flats", state: "Arunachal Pradesh", district: "East Siang", lat: 28.066, lng: 95.326, score: 58, level: "HIGH", soil: 71, slope: 24, elev: 153, rain: 89 },
    { name: "Mangan - North Sikkim Ridge", state: "Sikkim", district: "Mangan", lat: 27.513, lng: 88.534, score: 88, level: "VERY_HIGH", soil: 90, slope: 47, elev: 1950, rain: 198 },
    { name: "Gangtok - Chandmari Slope", state: "Sikkim", district: "Gangtok", lat: 27.338, lng: 88.606, score: 74, level: "HIGH", soil: 79, slope: 35, elev: 1437, rain: 132 },
    { name: "Shillong - Laitumkhrah", state: "Meghalaya", district: "East Khasi Hills", lat: 25.578, lng: 91.893, score: 61, level: "HIGH", soil: 75, slope: 28, elev: 1525, rain: 118 },
    { name: "Aizawl - New Capital Complex", state: "Mizoram", district: "Aizawl", lat: 23.727, lng: 92.718, score: 79, level: "HIGH", soil: 82, slope: 38, elev: 1132, rain: 141 },
    { name: "Lunglei - Zobawk", state: "Mizoram", district: "Lunglei", lat: 22.884, lng: 92.736, score: 66, level: "HIGH", soil: 77, slope: 31, elev: 1222, rain: 127 },
    { name: "Kohima - Japfu Ridge", state: "Nagaland", district: "Kohima", lat: 25.665, lng: 94.107, score: 71, level: "HIGH", soil: 76, slope: 34, elev: 1444, rain: 121 },
    { name: "Imphal East - Khul", state: "Manipur", district: "Imphal East", lat: 24.791, lng: 93.943, score: 44, level: "MODERATE", soil: 62, slope: 18, elev: 786, rain: 64 },
    { name: "Tamenglong - Hills", state: "Manipur", district: "Tamenglong", lat: 24.998, lng: 93.494, score: 52, level: "MODERATE", soil: 68, slope: 26, elev: 1170, rain: 92 },
    { name: "Silchar - Cachar Slopes", state: "Assam", district: "Cachar", lat: 24.834, lng: 92.792, score: 48, level: "MODERATE", soil: 66, slope: 18, elev: 66, rain: 77 },
    { name: "Agartala - Lembucherra", state: "Tripura", district: "West Tripura", lat: 23.871, lng: 91.287, score: 35, level: "MODERATE", soil: 58, slope: 14, elev: 28, rain: 43 },
  ];

  for (const z of zones) {
    await findOrCreateZone({
      name: z.name,
      state: z.state,
      district: z.district,
      geometry: polygonAround(z.lat, z.lng),
      riskScore: z.score,
      riskLevel: z.level,
      rainfall: z.rain,
      soilMoisture: z.soil,
      slope: z.slope,
      elevation: z.elev,
      lastUpdated: daysAgo(0, 5),
      modelVersion: "heuristic-v0-demo",
      dataQuality: "SIMULATED",
    });
  }
  console.log("[seed-data] risk zones done");
}

async function seedLandslides() {
  const rows = [
    { lat: 27.513, lng: 88.534, date: daysAgo(120), district: "Mangan", state: "Sikkim", rain: 230, sev: "MAJOR", road: true, infra: true },
    { lat: 27.338, lng: 88.606, date: daysAgo(210), district: "Gangtok", state: "Sikkim", rain: 175, sev: "MODERATE", road: true, infra: false },
    { lat: 27.586, lng: 91.859, date: daysAgo(95), district: "Tawang", state: "Arunachal Pradesh", rain: 210, sev: "MAJOR", road: true, infra: true },
    { lat: 28.066, lng: 95.326, date: daysAgo(300), district: "East Siang", state: "Arunachal Pradesh", rain: 150, sev: "MINOR", road: false, infra: false },
    { lat: 25.665, lng: 94.107, date: daysAgo(55), district: "Kohima", state: "Nagaland", rain: 185, sev: "MAJOR", road: true, infra: true },
    { lat: 23.727, lng: 92.718, date: daysAgo(160), district: "Aizawl", state: "Mizoram", rain: 205, sev: "MAJOR", road: true, infra: true },
    { lat: 25.578, lng: 91.893, date: daysAgo(420), district: "East Khasi Hills", state: "Meghalaya", rain: 195, sev: "MAJOR", road: true, infra: false },
    { lat: 24.998, lng: 93.494, date: daysAgo(250), district: "Tamenglong", state: "Manipur", rain: 160, sev: "MINOR", road: true, infra: false },
    { lat: 24.834, lng: 92.792, date: daysAgo(380), district: "Cachar", state: "Assam", rain: 140, sev: "MINOR", road: false, infra: false },
    { lat: 22.884, lng: 92.736, date: daysAgo(700), district: "Lunglei", state: "Mizoram", rain: 170, sev: "MODERATE", road: true, infra: true },
  ];
  for (const r of rows) {
    const existing = await prisma.landslideRecord.findFirst({
      where: { district: r.district, state: r.state, eventDate: r.date },
    });
    const data = {
      latitude: r.lat,
      longitude: r.lng,
      eventDate: r.date,
      district: r.district,
      state: r.state,
      rainfallCondition: r.rain,
      severity: r.sev,
      roadImpact: r.road,
      infrastructureImpact: r.infra,
      source: "GSI/NESAC public records (labelled historical)",
      dataQuality: "HISTORICAL",
    };
    if (existing) await prisma.landslideRecord.update({ where: { id: existing.id }, data });
    else await prisma.landslideRecord.create({ data });
  }
  console.log("[seed-data] landslide records done");
}

async function seedRoads() {
  const rows = [
    { name: "NH-10 Sevoke-Gangtok", number: "NH-10", state: "Sikkim", district: "Gangtok", status: "AT_RISK", lat: 27.22, lng: 88.5 },
    { name: "NH-31A Gangtok–Nathu La", number: "NH-31A", state: "Sikkim", district: "Gangtok", status: "OPEN", lat: 27.36, lng: 88.55 },
    { name: "NH-13 Tawang–Tuting", number: "NH-13", state: "Arunachal Pradesh", district: "Tawang", status: "BLOCKED", lat: 27.586, lng: 91.859 },
    { name: "NH-510 Mangan–Lachen", number: "NH-510", state: "Sikkim", district: "Mangan", status: "PARTIALLY_BLOCKED", lat: 27.513, lng: 88.534 },
    { name: "NH-2 Dimapur–Kohima", number: "NH-2", state: "Nagaland", district: "Kohima", status: "AT_RISK", lat: 25.665, lng: 94.107 },
    { name: "NH-54A Aizawl–Lunglei", number: "NH-54A", state: "Mizoram", district: "Aizawl", status: "AT_RISK", lat: 23.727, lng: 92.718 },
    { name: "NH-40 Shillong–Bhoj", number: "NH-40", state: "Meghalaya", district: "East Khasi Hills", status: "OPEN", lat: 25.578, lng: 91.893 },
  ];
  for (const r of rows) {
    const existing = await prisma.road.findFirst({ where: { name: r.name, district: r.district } });
    const data = {
      name: r.name,
      roadNumber: r.number,
      state: r.state,
      district: r.district,
      geometry: { type: "Point", coordinates: [r.lng, r.lat] },
      status: r.status,
      lastUpdated: daysAgo(0, 4),
    };
    if (existing) await prisma.road.update({ where: { id: existing.id }, data });
    else await prisma.road.create({ data });
  }
  console.log("[seed-data] roads done");
}

async function seedVillages() {
  const rows = [
    { name: "Sadam", state: "Sikkim", district: "Mangan", lat: 27.52, lng: 88.53, pop: 320 },
    { name: "Singtam", state: "Sikkim", district: "Gangtok", lat: 27.31, lng: 88.57, pop: 2400 },
    { name: "Lachung", state: "Sikkim", district: "Mangan", lat: 27.45, lng: 88.52, pop: 700 },
    { name: "Kangthil", state: "Arunachal Pradesh", district: "Tawang", lat: 27.6, lng: 91.85, pop: 180 },
    { name: "Makui", state: "Nagaland", district: "Kohima", lat: 25.68, lng: 94.1, pop: 420 },
    { name: "Chawnpui", state: "Mizoram", district: "Aizawl", lat: 23.74, lng: 92.71, pop: 610 },
    { name: "Laitrhun", state: "Meghalaya", district: "East Khasi Hills", lat: 25.58, lng: 91.89, pop: 350 },
    { name: "Seijang", state: "Manipur", district: "Tamenglong", lat: 25.0, lng: 93.5, pop: 260 },
  ];
  for (const r of rows) {
    const existing = await prisma.village.findFirst({ where: { name: r.name, district: r.district } });
    const data = { name: r.name, state: r.state, district: r.district, latitude: r.lat, longitude: r.lng, population: r.pop };
    if (existing) await prisma.village.update({ where: { id: existing.id }, data });
    else await prisma.village.create({ data });
  }
  console.log("[seed-data] villages done");
}

async function seedWeather() {
  const rows = [
    { lat: 27.338, lng: 88.606, temp: 18.2, hum: 86, r1: 3, r6: 12, r24: 48, r72: 132, sm: 79, code: 61 },
    { lat: 27.513, lng: 88.534, temp: 15.4, hum: 93, r1: 9, r6: 34, r24: 122, r72: 198, sm: 90, code: 63 },
    { lat: 27.586, lng: 91.859, temp: 8.8, hum: 95, r1: 6, r6: 21, r24: 96, r72: 156, sm: 84, code: 65 },
    { lat: 23.727, lng: 92.718, temp: 21.0, hum: 88, r1: 4, r6: 16, r24: 68, r72: 141, sm: 82, code: 61 },
    { lat: 25.665, lng: 94.107, temp: 19.5, hum: 90, r1: 2, r6: 9, r24: 41, r72: 121, sm: 76, code: 80 },
  ];
  const now = new Date();
  for (const r of rows) {
    await prisma.weatherData.create({
      data: {
        latitude: r.lat,
        longitude: r.lng,
        temperature: r.temp,
        humidity: r.hum,
        rainfall1h: r.r1,
        rainfall6h: r.r6,
        rainfall24h: r.r24,
        rainfall72h: r.r72,
        soilMoisture: r.sm,
        weatherCode: r.code,
        source: "Open-Meteo (recent, labelled)",
        dataQuality: "HISTORICAL",
        recordedAt: now,
      },
    });
  }
  console.log("[seed-data] weather done");
}

async function seedSensors() {
  const rows = [
    { sid: "SM-001", lat: 27.513, lng: 88.534, soil: 90, temp: 17.4 },
    { sid: "SM-002", lat: 27.338, lng: 88.606, soil: 79, temp: 18.2 },
    { sid: "SM-003", lat: 27.586, lng: 91.859, soil: 84, temp: 8.8 },
  ];
  const now = new Date();
  for (const r of rows) {
    await prisma.sensorData.create({
      data: {
        sensorId: r.sid,
        latitude: r.lat,
        longitude: r.lng,
        soilMoisture: r.soil,
        temperature: r.temp,
        dataQuality: "SIMULATED",
        recordedAt: now,
      },
    });
  }
  console.log("[seed-data] sensors done");
}

async function seedAlertsAndReports() {
  const zone = await prisma.riskZone.findFirst({ where: { name: { contains: "Mangan" } } });
  if (zone) {
    const existing = await prisma.alert.findFirst({ where: { riskZoneId: zone.id } });
    const data = {
      riskZoneId: zone.id,
      riskScore: 88,
      riskLevel: "VERY_HIGH",
      alertLevel: "CRITICAL",
      title: "Critical risk - Mangan North Sikkim Ridge",
      message: "Sustained rainfall and saturated soil indicate very high landslide risk.",
      contributingFactors: ["Heavy 72h rainfall", "High soil moisture", "Steep slope", "Prior landslide activity"],
      affectedRoad: "NH-510 Mangan-Lachen",
      affectedVillage: "Sadam",
      recommendedAction: "Pre-position field team; consider road closure for NH-510.",
      createdAt: daysAgo(0, 5),
    };
    if (existing) await prisma.alert.update({ where: { id: existing.id }, data });
    else await prisma.alert.create({ data });
  }
  console.log("[seed-data] alerts done (report seeding planned at runtime via API)");
}

async function runAll() {
  await seedUsers();
  await seedRiskZones();
  await seedLandslides();
  await seedRoads();
  await seedVillages();
  await seedWeather();
  await seedSensors();
  await seedAlertsAndReports();
  console.log(SEP);
  console.log("[seed-data] ALL SEEDING COMPLETE");
  console.log(SEP);
}

module.exports = { runAll, seedUsers, seedRiskZones, seedLandslides, seedRoads, seedVillages, seedWeather, seedSensors, seedAlertsAndReports };

const SEP = "----------------------------------------";

if (require.main === module) {
  runAll()
    .then(() => prisma.$disconnect())
    .catch((e) => {
      console.error("[seed-data] error:", e);
      process.exit(1);
    });
}