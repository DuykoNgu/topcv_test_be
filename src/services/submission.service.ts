import { Prisma } from "../generated/prisma/client";
import { SubmissionRepository } from "../repository/submission.repository";
import prisma from "../services/prisma.service";

export type SubmissionWithDetails = any;

export class SubmissionService {
  constructor(private readonly submissionRepository: SubmissionRepository) {}

  private static readonly USER_PROJECTION: Prisma.UserSelect = {
    id: true,
    username: true,
    name: true,
    email: true,
  };

  private static readonly FORM_PROJECTION: Prisma.FormSelect = {
    id: true,
    title: true,
    description: true,
    order: true,
    status: true,
    createdBy: true,
    updatedBy: true,
    createdAt: true,
    updatedAt: true,
  };

  private static readonly FIELD_PROJECTION: Prisma.FieldSelect = {
    id: true,
    formId: true,
    label: true,
    type: true,
    createdBy: true,
    updatedBy: true,
    createdAt: true,
    updatedAt: true,
  };

  private static readonly SUBMISSION_VALUE_SELECT = {
    id: true,
    fieldId: true,
    value: true,
    createdBy: true,
    updatedBy: true,
    createdAt: true,
    updatedAt: true,
    field: {
      select: SubmissionService.FIELD_PROJECTION,
    },
  };

  private static readonly SUBMISSION_FULL_INCLUDE = {
    form: {
      select: SubmissionService.FORM_PROJECTION,
    },
    user: {
      select: SubmissionService.USER_PROJECTION,
    },
    values: {
      select: SubmissionService.SUBMISSION_VALUE_SELECT,
    },
  };

  /**
   * Lấy tất cả submissions với đầy đủ thông tin:
   * - Form cơ bản
   * - User thực hiện
   * - Danh sách values + thông tin field tương ứng
   */
  async getAllSubmissionsWithDetails(): Promise<any[]> {
    return this.submissionRepository.findWithDetails({
      include: SubmissionService.SUBMISSION_FULL_INCLUDE,
    });
  }

  /**
   * Nhân viên submit form:
   * - Validate form tồn tại và có status ACTIVE
   * - Validate tất cả fields thuộc về form
   * - Tạo submission cùng values và trả về kết quả đầy đủ
   */
  /**
   * Nhân viên submit form:
   * - Validate form tồn tại và có status ACTIVE
   * - Validate tất cả fields thuộc về form
   * - Tạo submission cùng values và trả về kết quả đầy đủ
   */
  async submitForm(formId: string, userId: string, values: Array<{ fieldId: string; value: string }>): Promise<any> {
    // Verify form exists and is active
    const form = await prisma.form.findUnique({
      where: { id: formId },
      select: { id: true, status: true, deleteFlag: true },
    });

    if (!form || form.deleteFlag) {
      throw new Error("Form not found");
    }
    if (form.status !== "ACTIVE") {
      throw new Error("Form is not active");
    }

    // Verify all fields exist and belong to this form
    const fieldIds = values.map((v) => v.fieldId);
    const fields = await prisma.field.findMany({
      where: {
        id: { in: fieldIds },
        formId,
        deleteFlag: false,
      },
      select: { id: true },
    });

    if (fields.length !== fieldIds.length) {
      throw new Error("One or more fields are invalid");
    }

    // Create submission with full detail response
    return this.submissionRepository.create(
      {
        form: { connect: { id: formId } },
        user: { connect: { id: userId } },
        createdBy: userId,
        updatedBy: userId,
        values: {
          create: values.map((v) => ({
            ...v,
            createdBy: userId,
            updatedBy: userId,
          })),
        },
      },
      {
        include: SubmissionService.SUBMISSION_FULL_INCLUDE,
      },
    );
  }

  /**
   * Lấy lịch sử submissions của người dùng hiện tại cho một form cụ thể
   */
  async getMySubmissionsForForm(formId: string, userId: string): Promise<any[]> {
    return this.submissionRepository.findWithDetails({
      where: {
        formId,
        submittedBy: userId,
      },
      include: SubmissionService.SUBMISSION_FULL_INCLUDE,
      orderBy: { submittedAt: "desc" },
    });
  }
}
