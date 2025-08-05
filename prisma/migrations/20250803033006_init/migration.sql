-- CreateTable
CREATE TABLE "public"."polls" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "organizer_timezone" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "polls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."time_slots" (
    "id" TEXT NOT NULL,
    "poll_id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "start_time" VARCHAR(5) NOT NULL,
    "end_time" VARCHAR(5) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "time_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."participants" (
    "id" TEXT NOT NULL,
    "poll_id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255),
    "timezone" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."availability" (
    "id" TEXT NOT NULL,
    "participant_id" TEXT NOT NULL,
    "time_slot_id" TEXT NOT NULL,
    "is_available" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "availability_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "time_slots_poll_id_idx" ON "public"."time_slots"("poll_id");

-- CreateIndex
CREATE INDEX "time_slots_date_idx" ON "public"."time_slots"("date");

-- CreateIndex
CREATE INDEX "participants_poll_id_idx" ON "public"."participants"("poll_id");

-- CreateIndex
CREATE UNIQUE INDEX "participants_poll_id_email_key" ON "public"."participants"("poll_id", "email");

-- CreateIndex
CREATE INDEX "availability_time_slot_id_idx" ON "public"."availability"("time_slot_id");

-- CreateIndex
CREATE INDEX "availability_participant_id_idx" ON "public"."availability"("participant_id");

-- CreateIndex
CREATE UNIQUE INDEX "availability_participant_id_time_slot_id_key" ON "public"."availability"("participant_id", "time_slot_id");

-- AddForeignKey
ALTER TABLE "public"."time_slots" ADD CONSTRAINT "time_slots_poll_id_fkey" FOREIGN KEY ("poll_id") REFERENCES "public"."polls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."participants" ADD CONSTRAINT "participants_poll_id_fkey" FOREIGN KEY ("poll_id") REFERENCES "public"."polls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."availability" ADD CONSTRAINT "availability_participant_id_fkey" FOREIGN KEY ("participant_id") REFERENCES "public"."participants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."availability" ADD CONSTRAINT "availability_time_slot_id_fkey" FOREIGN KEY ("time_slot_id") REFERENCES "public"."time_slots"("id") ON DELETE CASCADE ON UPDATE CASCADE;
