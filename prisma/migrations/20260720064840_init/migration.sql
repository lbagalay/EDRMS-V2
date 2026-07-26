-- CreateTable
CREATE TABLE `account` (
    `account_id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NULL,
    `password` VARCHAR(255) NOT NULL,
    `first_name` VARCHAR(255) NULL,
    `middle_name` VARCHAR(255) NULL,
    `last_name` VARCHAR(255) NULL,
    `birthdate` DATE NULL,
    `role` ENUM('ADMIN', 'STAFF', 'RECEPTIONIST') NOT NULL DEFAULT 'STAFF',
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `account_username_key`(`username`),
    UNIQUE INDEX `account_email_key`(`email`),
    PRIMARY KEY (`account_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `session` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `session_token` VARCHAR(255) NOT NULL,
    `user_id` INTEGER NOT NULL,
    `expires` DATETIME(0) NOT NULL,

    UNIQUE INDEX `session_session_token_key`(`session_token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `patient` (
    `patient_id` INTEGER NOT NULL AUTO_INCREMENT,
    `last_name` VARCHAR(255) NOT NULL,
    `first_name` VARCHAR(255) NOT NULL,
    `middle_name` VARCHAR(255) NULL,
    `birthdate` DATE NULL,
    `sex` ENUM('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY') NULL,
    `contact_number` VARCHAR(255) NULL,
    `email` VARCHAR(255) NULL,
    `address` VARCHAR(255) NULL,
    `medical_alerts` TEXT NULL,
    `is_deleted` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`patient_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `appointment` (
    `appointment_id` INTEGER NOT NULL AUTO_INCREMENT,
    `patient_id` INTEGER NULL,
    `name` VARCHAR(255) NOT NULL,
    `contact_number` VARCHAR(255) NOT NULL,
    `date_schedule` DATE NOT NULL,
    `time_schedule` TIME(0) NOT NULL,
    `purpose` TEXT NOT NULL,
    `is_previous_patient` BOOLEAN NOT NULL DEFAULT false,
    `status` ENUM('SCHEDULED', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW') NOT NULL DEFAULT 'SCHEDULED',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`appointment_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `visit` (
    `visit_id` INTEGER NOT NULL AUTO_INCREMENT,
    `patient_id` INTEGER NOT NULL,
    `visit_purpose` VARCHAR(255) NOT NULL,
    `date_visit` DATE NOT NULL,
    `additional_fees` DECIMAL(10, 2) NOT NULL,
    `amount_paid` DECIMAL(10, 2) NOT NULL,
    `discount` DECIMAL(10, 2) NOT NULL,
    `prescription` TEXT NULL,
    `notes` TEXT NULL,
    `is_deleted` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`visit_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `treatment` (
    `treatment_id` INTEGER NOT NULL AUTO_INCREMENT,
    `treatment_name` VARCHAR(255) NOT NULL,
    `treatment_fee` DECIMAL(10, 2) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`treatment_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `treatment_rendered` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `visit_id` INTEGER NOT NULL,
    `treatment_id` INTEGER NOT NULL,
    `fee_at_time` DECIMAL(10, 2) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `vital_signs` (
    `vital_sign_id` INTEGER NOT NULL AUTO_INCREMENT,
    `visit_id` INTEGER NOT NULL,
    `temperature` DECIMAL(4, 1) NOT NULL,
    `pulse_rate` INTEGER NOT NULL,
    `systolic_bp` INTEGER NOT NULL,
    `diastolic_bp` INTEGER NOT NULL,
    `time_taken` TIME(0) NOT NULL,
    `is_deleted` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`vital_sign_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `session` ADD CONSTRAINT `session_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `account`(`account_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `appointment` ADD CONSTRAINT `appointment_patient_id_fkey` FOREIGN KEY (`patient_id`) REFERENCES `patient`(`patient_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `visit` ADD CONSTRAINT `visit_patient_id_fkey` FOREIGN KEY (`patient_id`) REFERENCES `patient`(`patient_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `treatment_rendered` ADD CONSTRAINT `treatment_rendered_visit_id_fkey` FOREIGN KEY (`visit_id`) REFERENCES `visit`(`visit_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `treatment_rendered` ADD CONSTRAINT `treatment_rendered_treatment_id_fkey` FOREIGN KEY (`treatment_id`) REFERENCES `treatment`(`treatment_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vital_signs` ADD CONSTRAINT `vital_signs_visit_id_fkey` FOREIGN KEY (`visit_id`) REFERENCES `visit`(`visit_id`) ON DELETE CASCADE ON UPDATE CASCADE;
