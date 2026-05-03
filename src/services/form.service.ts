import { Prisma } from "../generated/prisma/client";
import { FormRepository } from "../repository/form.repository";

export type FormWithFields = any;

export class FormService {
  constructor(private readonly formRepository: FormRepository) {}

  // Projection constants
  private static readonly FORM_PROJECTION: Prisma.FormSelect = {
    id: true,
    title: true,
    creator: {select: {username: true}},
    description: true,
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
    required: true,
    options: true,
    createdAt: true,
    updatedAt: true,
  };

  private static readonly FORM_WITH_FIELDS_SELECT: Prisma.FormSelect = {
    ...FormService.FORM_PROJECTION,
    fields: {
      select: FormService.FIELD_PROJECTION,
    },
  };

  /**
   * Lấy danh sách form có phân trang (kèm fields)
   */
  async getPaginatedForms(skip: number, take: number): Promise<{ data: any[]; total: number }> {
    return this.formRepository.findWithPagination(skip, take, {
      select: FormService.FORM_WITH_FIELDS_SELECT,
      orderBy: { order: "asc" },
    });
  }

  /**
   * Lấy chi tiết 1 form theo ID (kèm fields)
   */
  async getFormById(id: string): Promise<any | null> {
    return this.formRepository.findById(id, {
      select: FormService.FORM_WITH_FIELDS_SELECT,
    });
  }

  /**
   * Lấy tất cả form active, sắp xếp theo trường `order`
   */
  async getActiveForms(): Promise<any[]> {
    return this.formRepository.findActiveForSubmission({
      select: FormService.FORM_WITH_FIELDS_SELECT,
      orderBy: { order: "asc" },
    });
  }

  /**
   * Tạo form mới và trả về form với danh sách fields
   */
  async createForm(data: any, userId?: string): Promise<any> {
    const formData = {
      ...data,
      createdBy: userId,
      updatedBy: userId,
    };
    return this.formRepository.create(formData, {
      select: FormService.FORM_WITH_FIELDS_SELECT,
    });
  }

  /**
   * Cập nhật form theo ID và trả về form đã cập nhật (kèm fields)
   */
  async updateForm(id: string, data: any, userId?: string): Promise<any | null> {
    const formData = {
      ...data,
      updatedBy: userId,
    };
    return this.formRepository.update(id, formData, {
      select: FormService.FORM_WITH_FIELDS_SELECT,
    });
  }

  /**
   * Xóa mềm form theo ID và trả về form đã xóa
   */
  async deleteForm(id: string, userId?: string): Promise<any | null> {
    return this.formRepository.softDelete(id, {
      select: FormService.FORM_WITH_FIELDS_SELECT,
      updatedBy: userId,
    });
  }
}
