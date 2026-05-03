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
   * Lấy danh sách tất cả các bản ghi đã nộp kèm thông tin chi tiết.
   * Bao gồm thông tin về Form, User và các giá trị đã nhập của từng trường.
   * @returns Danh sách submissions với đầy đủ chi tiết.
   */
  async getAllSubmissionsWithDetails(): Promise<any[]> {
    return this.submissionRepository.findWithDetails({
      include: SubmissionService.SUBMISSION_FULL_INCLUDE,
    });
  }

  /**
   * Thực hiện lưu một bản ghi nộp form mới.
   * Kiểm tra tính hợp lệ của form (phải tồn tại và đang hoạt động) 
   * và tính hợp lệ của các trường thông tin được nộp.
   * @param formId ID của form cần nộp.
   * @param userId ID của người thực hiện nộp.
   * @param values Danh sách các giá trị tương ứng với từng trường trong form.
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
   * Lấy lịch sử các lần nộp form của người dùng hiện tại đối với một form cụ thể.
   * @param formId ID của form cần lấy lịch sử.
   * @param userId ID của người dùng.
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

  /**
   * Cập nhật thông tin của một bản ghi đã nộp trước đó.
   * Quy trình: Kiểm tra quyền sở hữu, trạng thái form, sau đó xóa các giá trị cũ
   * và lưu lại bộ giá trị mới trong một transaction.
   * @param submissionId ID của bản ghi cần cập nhật.
   * @param userId ID của người thực hiện (để kiểm tra quyền).
   * @param values Bộ giá trị mới cho các trường.
   */
  async updateSubmission(submissionId: string, userId: string, values: Array<{ fieldId: string; value: string }>): Promise<any> {
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: { form: true },
    });

    if (!submission || submission.deleteFlag) {
      throw new Error("Submission not found");
    }

    if (submission.submittedBy !== userId) {
      throw new Error("You do not have permission to edit this submission");
    }

    const form = submission.form;
    if (form.status !== "ACTIVE" || form.deleteFlag) {
      throw new Error("Form is not active");
    }

    const fieldIds = values.map((v) => v.fieldId);
    const fields = await prisma.field.findMany({
      where: {
        id: { in: fieldIds },
        formId: form.id,
        deleteFlag: false,
      },
      select: { id: true },
    });

    if (fields.length !== fieldIds.length) {
      throw new Error("One or more fields are invalid");
    }

    return prisma.$transaction(async (tx) => {
      await tx.submissionValue.deleteMany({
        where: { submissionId },
      });

      return tx.submission.update({
        where: { id: submissionId },
        data: {
          updatedBy: userId,
          version: { increment: 1 },
          values: {
            create: values.map((v) => ({
              ...v,
              createdBy: userId,
              updatedBy: userId,
            })),
          },
        },
        include: SubmissionService.SUBMISSION_FULL_INCLUDE,
      });
    });
  }
}
