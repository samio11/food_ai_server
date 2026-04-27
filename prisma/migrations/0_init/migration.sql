-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "food" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "category" VARCHAR(50),
    "cuisine" VARCHAR(50),
    "description" TEXT,
    "price" DECIMAL(10,2),
    "discount_percent" INTEGER DEFAULT 0,
    "discounted_price" DECIMAL(10,2),
    "calories" INTEGER,
    "prep_time_minutes" INTEGER,
    "spice_level" VARCHAR(20),
    "dietary_tag" VARCHAR(30),
    "rating" DECIMAL(3,1),
    "review_count" INTEGER DEFAULT 0,
    "is_available" VARCHAR(20) DEFAULT 'Available',
    "is_featured" VARCHAR(5) DEFAULT 'No',
    "is_new" VARCHAR(5) DEFAULT 'No',
    "image_url" TEXT,
    "created_at" DATE,

    CONSTRAINT "food_pkey" PRIMARY KEY ("id")
);
