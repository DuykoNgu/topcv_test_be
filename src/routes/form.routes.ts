import { Router } from "express";
import { FormController } from "../controllers/form.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { requireAdmin, requireAdminOrStaff } from "../middleware/role.middleware";
import { validateRequest } from "../middleware/validation.middleware";
import { createFormSchema, updateFormSchema } from "../schemas/form.schema";


const router = Router();
const formController = new FormController();

/**
 * @swagger
 * tags:
 *   name: Forms
 *   description: Form management
 */

/**
 * @swagger
 * /api/forms:
 *   get:
 *     summary: List all forms (Admin only)
 *     tags: [Forms]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of forms
 */
router.get('/', authMiddleware, requireAdmin, formController.getAllForms.bind(formController));

/**
 * @swagger
 * /api/forms/active:
 *   get:
 *     summary: List active forms (Staff/Admin)
 *     tags: [Forms]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of active forms
 */
router.get('/active', authMiddleware, requireAdminOrStaff, formController.getActiveForms.bind(formController));

/**
 * @swagger
 * /api/forms/{id}:
 *   get:
 *     summary: Get form by ID
 *     tags: [Forms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Form details
 */
router.get('/:id', authMiddleware, requireAdminOrStaff, formController.getFormById.bind(formController));

/**
 * @swagger
 * /api/forms:
 *   post:
 *     summary: Create a new form (Admin only)
 *     tags: [Forms]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Form created
 */
router.post('/', authMiddleware, requireAdmin, validateRequest(createFormSchema), formController.createForm.bind(formController));


/**
 * @swagger
 * /api/forms/{id}:
 *   put:
 *     summary: Update a form (Admin only)
 *     tags: [Forms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Form updated
 */
router.put('/:id', authMiddleware, requireAdmin, validateRequest(updateFormSchema), formController.updateForm.bind(formController));


/**
 * @swagger
 * /api/forms/{id}:
 *   delete:
 *     summary: Delete a form (Admin only)
 *     tags: [Forms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Form deleted
 */
router.delete('/:id', authMiddleware, requireAdmin, validateRequest, formController.deleteForm.bind(formController));

export default router;

