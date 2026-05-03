import { Router } from "express";
import { SubmissionController } from "../controllers/submission.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { requireAdmin, requireAdminOrStaff } from "../middleware/role.middleware";
import { validateRequest } from "../middleware/validation.middleware";
import { submitFormSchema } from "../schemas/submission.schema";


const submissionController = new SubmissionController();

/**
 * @swagger
 * tags:
 *   name: Submissions
 *   description: Form submission management
 */

// === Router cho /api/submissions ===
export const submissionRouter = Router();

/**
 * @swagger
 * /api/submissions:
 *   get:
 *     summary: List all submissions (Admin only)
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of submissions
 */
submissionRouter.get('/', authMiddleware, requireAdmin, submissionController.getAllSubmissions.bind(submissionController));

// === Router cho /api/forms (submit action) ===
export const formSubmitRouter = Router();

/**
 * @swagger
 * /api/forms/{formId}/submit:
 *   post:
 *     summary: Submit a form (Staff/Admin)
 *     tags: [Submissions]
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
 *             properties:
 *               answers:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     fieldId:
 *                       type: string
 *                     value:
 *                       type: string
 *     responses:
 *       201:
 *         description: Submission created
 */
formSubmitRouter.post('/:formId/submit', authMiddleware, requireAdminOrStaff, validateRequest(submitFormSchema), submissionController.submitForm.bind(submissionController));


/**
 * @swagger
 * /api/forms/{formId}/submissions/me:
 *   get:
 *     summary: Get my submissions for a form
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: formId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of my submissions
 */
formSubmitRouter.get('/:formId/submissions/me', authMiddleware, requireAdminOrStaff, submissionController.getMySubmissionsForForm.bind(submissionController));

