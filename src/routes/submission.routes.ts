import { Router } from "express";
import { SubmissionController } from "../controllers/submission.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { requireAdmin, requireAdminOrStaff } from "../middleware/role.middleware";
import { validateRequest } from "../middleware/validation.middleware";

const submissionController = new SubmissionController();

// === Router cho /api/submissions ===
export const submissionRouter = Router();

// GET /api/submissions — ADMIN only (view all submissions)
submissionRouter.get('/', authMiddleware, requireAdmin, submissionController.getAllSubmissions.bind(submissionController));

// === Router cho /api/forms (submit action) ===
export const formSubmitRouter = Router();

// POST /api/forms/:formId/submit — STAFF/ADMIN (staff can submit)
formSubmitRouter.post('/:formId/submit', authMiddleware, requireAdminOrStaff, validateRequest, submissionController.submitForm.bind(submissionController));

// GET /api/forms/:formId/submissions/me — STAFF/ADMIN
formSubmitRouter.get('/:formId/submissions/me', authMiddleware, requireAdminOrStaff, submissionController.getMySubmissionsForForm.bind(submissionController));
