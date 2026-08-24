-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'AUTHORITY', 'FIELD_OFFICER', 'CITIZEN');

-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('LOW', 'MODERATE', 'HIGH', 'VERY_HIGH');

-- CreateEnum
CREATE TYPE "AlertLevel" AS ENUM ('INFO', 'WATCH', 'WARNING', 'CRITICAL');

-- CreateEnum
CREATE TYPE "RoadStatus" AS ENUM ('OPEN', 'AT_RISK', 'BLOCKED', 'PARTIALLY_BLOCKED', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "SyncStatus" AS ENUM ('PENDING', 'SYNCING', 'SYNCED', 'FAILED');

-- CreateEnum
CREATE TYPE "DataQuality" AS ENUM ('LIVE', 'HISTORICAL', 'SIMULATED', 'DEMO');

-- CreateEnum
CREATE TYPE "IncidentType" AS ENUM ('CRACK', 'SLOPE_MOVEMENT', 'ROCKFALL', 'MUD_DEBRIS', 'ROAD_BLOCKAGE', 'WATER_OVERFLOW', 'OTHER');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'CITIZEN',
    "phone" TEXT,
    "district" TEXT,
    "state" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "risk_zones" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "geometry" JSONB NOT NULL,
    "risk_score" INTEGER,
    "risk_level" "RiskLevel",
    "rainfall" DOUBLE PRECISION,
    "soil_moisture" DOUBLE PRECISION,
    "slope" DOUBLE PRECISION,
    "elevation" DOUBLE PRECISION,
    "affected_roads" JSONB,
    "nearby_villages" JSONB,
    "last_updated" TIMESTAMP(3),
    "model_version" TEXT,
    "data_quality" "DataQuality" NOT NULL DEFAULT 'SIMULATED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "risk_zones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "predictions" (
    "id" UUID NOT NULL,
    "risk_zone_id" UUID NOT NULL,
    "risk_score" INTEGER NOT NULL,
    "risk_level" "RiskLevel" NOT NULL,
    "model_probability" DOUBLE PRECISION,
    "top_factors" JSONB,
    "model_version" TEXT,
    "feature_version" TEXT,
    "dataSources" JSONB,
    "input_features" JSONB,
    "prediction_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "predictions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weather_data" (
    "id" UUID NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "temperature" DOUBLE PRECISION,
    "humidity" DOUBLE PRECISION,
    "rainfall_1h" DOUBLE PRECISION,
    "rainfall_6h" DOUBLE PRECISION,
    "rainfall_24h" DOUBLE PRECISION,
    "rainfall_72h" DOUBLE PRECISION,
    "soil_moisture" DOUBLE PRECISION,
    "weather_code" INTEGER,
    "source" TEXT NOT NULL DEFAULT 'open-meteo',
    "data_quality" "DataQuality" NOT NULL DEFAULT 'LIVE',
    "recorded_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "weather_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sensor_data" (
    "id" UUID NOT NULL,
    "sensor_id" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "soil_moisture" DOUBLE PRECISION,
    "temperature" DOUBLE PRECISION,
    "data_quality" "DataQuality" NOT NULL DEFAULT 'SIMULATED',
    "recorded_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sensor_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "landslide_records" (
    "id" UUID NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "event_date" TIMESTAMP(3) NOT NULL,
    "district" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "rainfall_condition" DOUBLE PRECISION,
    "severity" TEXT,
    "road_impact" BOOLEAN DEFAULT false,
    "infrastructure_impact" BOOLEAN DEFAULT false,
    "description" TEXT,
    "source" TEXT,
    "data_quality" "DataQuality" NOT NULL DEFAULT 'HISTORICAL',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "landslide_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "field_reports" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "incident_type" "IncidentType" NOT NULL,
    "description" TEXT,
    "photo_url" TEXT,
    "road_status" "RoadStatus",
    "sync_status" "SyncStatus" NOT NULL DEFAULT 'PENDING',
    "data_quality" "DataQuality" NOT NULL DEFAULT 'LIVE',
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "field_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alerts" (
    "id" UUID NOT NULL,
    "risk_zone_id" UUID NOT NULL,
    "risk_score" INTEGER NOT NULL,
    "risk_level" "RiskLevel" NOT NULL,
    "alert_level" "AlertLevel" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT,
    "contributing_factors" JSONB,
    "affected_road" TEXT,
    "affected_village" TEXT,
    "recommended_action" TEXT,
    "acknowledged" BOOLEAN NOT NULL DEFAULT false,
    "acknowledged_by" TEXT,
    "acknowledged_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roads" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "road_number" TEXT,
    "state" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "geometry" JSONB,
    "status" "RoadStatus" NOT NULL DEFAULT 'UNKNOWN',
    "last_updated" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "villages" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "population" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "villages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "satellite_observations" (
    "id" UUID NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "observation_type" TEXT NOT NULL,
    "description" TEXT,
    "change_detected" BOOLEAN DEFAULT false,
    "image_url" TEXT,
    "data_quality" "DataQuality" NOT NULL DEFAULT 'SIMULATED',
    "observed_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "satellite_observations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL,
    "user_id" TEXT,
    "action" TEXT NOT NULL,
    "resource" TEXT,
    "resource_id" TEXT,
    "details" JSONB,
    "ip_address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "risk_zones_state_district_idx" ON "risk_zones"("state", "district");

-- CreateIndex
CREATE INDEX "predictions_risk_zone_id_idx" ON "predictions"("risk_zone_id");

-- CreateIndex
CREATE INDEX "predictions_prediction_time_idx" ON "predictions"("prediction_time");

-- CreateIndex
CREATE INDEX "weather_data_latitude_longitude_idx" ON "weather_data"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "weather_data_recorded_at_idx" ON "weather_data"("recorded_at");

-- CreateIndex
CREATE INDEX "sensor_data_sensor_id_idx" ON "sensor_data"("sensor_id");

-- CreateIndex
CREATE INDEX "sensor_data_recorded_at_idx" ON "sensor_data"("recorded_at");

-- CreateIndex
CREATE INDEX "landslide_records_state_district_idx" ON "landslide_records"("state", "district");

-- CreateIndex
CREATE INDEX "landslide_records_event_date_idx" ON "landslide_records"("event_date");

-- CreateIndex
CREATE INDEX "field_reports_user_id_idx" ON "field_reports"("user_id");

-- CreateIndex
CREATE INDEX "field_reports_submitted_at_idx" ON "field_reports"("submitted_at");

-- CreateIndex
CREATE INDEX "alerts_risk_zone_id_idx" ON "alerts"("risk_zone_id");

-- CreateIndex
CREATE INDEX "alerts_alert_level_idx" ON "alerts"("alert_level");

-- CreateIndex
CREATE INDEX "alerts_created_at_idx" ON "alerts"("created_at");

-- CreateIndex
CREATE INDEX "roads_state_district_idx" ON "roads"("state", "district");

-- CreateIndex
CREATE INDEX "villages_state_district_idx" ON "villages"("state", "district");

-- CreateIndex
CREATE INDEX "satellite_observations_observed_at_idx" ON "satellite_observations"("observed_at");

-- CreateIndex
CREATE INDEX "notifications_user_id_is_read_idx" ON "notifications"("user_id", "is_read");

-- CreateIndex
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at");

-- CreateIndex
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs"("user_id");

-- AddForeignKey
ALTER TABLE "predictions" ADD CONSTRAINT "predictions_risk_zone_id_fkey" FOREIGN KEY ("risk_zone_id") REFERENCES "risk_zones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "field_reports" ADD CONSTRAINT "field_reports_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_risk_zone_id_fkey" FOREIGN KEY ("risk_zone_id") REFERENCES "risk_zones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
