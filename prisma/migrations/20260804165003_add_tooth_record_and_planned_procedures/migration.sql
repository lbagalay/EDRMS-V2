/*
  Warnings:

  - Added the required column `patient_id` to the `treatment_rendered` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `treatment_rendered` DROP FOREIGN KEY `treatment_rendered_visit_id_fkey`;

-- DropIndex
DROP INDEX `treatment_rendered_visit_id_fkey` ON `treatment_rendered`;

-- AlterTable
ALTER TABLE `treatment_rendered` ADD COLUMN `patient_id` INTEGER NOT NULL,
    ADD COLUMN `status` ENUM('PLANNED', 'COMPLETED') NOT NULL DEFAULT 'COMPLETED',
    ADD COLUMN `tooth_number` INTEGER NULL,
    MODIFY `visit_id` INTEGER NULL;

-- CreateTable
CREATE TABLE `tooth_record` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `patient_id` INTEGER NOT NULL,
    `tooth_number` INTEGER NOT NULL,
    `condition` ENUM('HEALTHY', 'CARIES', 'FILLED', 'MISSING', 'CROWNED', 'ROOT_CANAL', 'EXTRACTED', 'OTHER') NOT NULL DEFAULT 'HEALTHY',
    `condition_note` TEXT NULL,
    `dentist_notes` TEXT NULL,
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `tooth_record_patient_id_tooth_number_key`(`patient_id`, `tooth_number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `treatment_rendered` ADD CONSTRAINT `treatment_rendered_patient_id_fkey` FOREIGN KEY (`patient_id`) REFERENCES `patient`(`patient_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `treatment_rendered` ADD CONSTRAINT `treatment_rendered_visit_id_fkey` FOREIGN KEY (`visit_id`) REFERENCES `visit`(`visit_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tooth_record` ADD CONSTRAINT `tooth_record_patient_id_fkey` FOREIGN KEY (`patient_id`) REFERENCES `patient`(`patient_id`) ON DELETE CASCADE ON UPDATE CASCADE;
