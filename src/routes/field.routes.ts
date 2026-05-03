import { Router } from "express";
import { FieldController } from "../controllers/field.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { requireAdmin } from "../middleware/role.middleware";
import { validateRequest } from "../middleware/validation.middleware";

const router = Router();
const fieldController = new FieldController();

// POST /api/forms/:formId/fields — ADMIN only
router.post('/:formId/fields', authMiddleware, requireAdmin, validateRequest, fieldController.createField.bind(fieldController));

// PUT /api/forms/:formId/fields/:fieldId — ADMIN only
router.put('/:formId/fields/:fieldId', authMiddleware, requireAdmin, validateRequest, fieldController.updateField.bind(fieldController));

// DELETE /api/forms/:formId/fields/:fieldId — ADMIN only
router.delete('/:formId/fields/:fieldId', authMiddleware, requireAdmin, validateRequest, fieldController.deleteField.bind(fieldController));

export default router;
