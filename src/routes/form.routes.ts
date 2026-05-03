import { Router } from "express";
import { FormController } from "../controllers/form.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { requireAdmin, requireAdminOrStaff } from "../middleware/role.middleware";
import { validateRequest } from "../middleware/validation.middleware";

const router = Router();
const formController = new FormController();

// GET /api/forms — ADMIN only (list all forms including drafts)
router.get('/', authMiddleware, requireAdmin, formController.getAllForms.bind(formController));

// GET /api/forms/active — STAFF/ADMIN (forms available for submission)
router.get('/active', authMiddleware, requireAdminOrStaff, formController.getActiveForms.bind(formController));

// GET /api/forms/:id — STAFF/ADMIN (view form details)
router.get('/:id', authMiddleware, requireAdminOrStaff, formController.getFormById.bind(formController));

// POST /api/forms — ADMIN only
router.post('/', authMiddleware, requireAdmin, validateRequest, formController.createForm.bind(formController));

// PUT /api/forms/:id — ADMIN only
router.put('/:id', authMiddleware, requireAdmin, validateRequest, formController.updateForm.bind(formController));

// DELETE /api/forms/:id — ADMIN only
router.delete('/:id', authMiddleware, requireAdmin, validateRequest, formController.deleteForm.bind(formController));

export default router;
