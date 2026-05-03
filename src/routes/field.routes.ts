import { Router } from "express";
import { FieldController } from "../controllers/field.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { requireAdmin } from "../middleware/role.middleware";
import { validateRequest } from "../middleware/validation.middleware";
import { createFieldSchema, updateFieldSchema } from "../schemas/field.schema";


const router = Router();
const fieldController = new FieldController();

/**
 * @swagger
 * tags:
 *   name: Fields
 *   description: Form field management
 */

/**
 * @swagger
 * /api/forms/{formId}/fields:
 *   post:
 *     summary: Create a new field for a form (Admin only)
 *     tags: [Fields]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: formId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - label
 *               - type
 *             properties:
 *               label:
 *                 type: string
 *               type:
 *                 type: string
 *               options:
 *                 type: array
 *                 items:
 *                   type: string
 *               required:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Field created
 */
router.post('/:formId/fields', authMiddleware, requireAdmin, validateRequest(createFieldSchema), fieldController.createField.bind(fieldController));


/**
 * @swagger
 * /api/forms/{formId}/fields/{fieldId}:
 *   put:
 *     summary: Update a field (Admin only)
 *     tags: [Fields]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: formId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: fieldId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               label:
 *                 type: string
 *               type:
 *                 type: string
 *               options:
 *                 type: array
 *                 items:
 *                   type: string
 *               required:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Field updated
 */
router.put('/:formId/fields/:fieldId', authMiddleware, requireAdmin, validateRequest(updateFieldSchema), fieldController.updateField.bind(fieldController));


/**
 * @swagger
 * /api/forms/{formId}/fields/{fieldId}:
 *   delete:
 *     summary: Delete a field (Admin only)
 *     tags: [Fields]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: formId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: fieldId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Field deleted
 */
router.delete('/:formId/fields/:fieldId', authMiddleware, requireAdmin, fieldController.deleteField.bind(fieldController));


export default router;

