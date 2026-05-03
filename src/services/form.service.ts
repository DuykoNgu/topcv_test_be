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
   * Lấy danh sách các mẫu form có phân trang.
   * Thường dùng cho trang quản trị (Admin).
   * @param skip Số bản ghi bỏ qua.
   * @param take Số bản ghi cần lấy.
   */
  async getPaginatedForms(skip: number, take: number): Promise<{ data: any[]; total: number }> {
    return this.formRepository.findWithPagination(skip, take, {
      select: FormService.FORM_WITH_FIELDS_SELECT,
      orderBy: { order: "asc" },
    });
  }

  /**
   * Truy vấn chi tiết một mẫu form dựa trên ID.
   * @param id ID của form cần lấy thông tin.
   */
  async getFormById(id: string): Promise<any | null> {
    return this.formRepository.findById(id, {
      select: FormService.FORM_WITH_FIELDS_SELECT,
    });
  }

  /**
   * Lấy danh sách tất cả các form đang ở trạng thái ACTIVE (đang hoạt động).
   * Thường dùng cho nhân viên để thực hiện điền form.
   */
  async getActiveForms(): Promise<any[]> {
    return this.formRepository.findActiveForSubmission({
      select: FormService.FORM_WITH_FIELDS_SELECT,
      orderBy: { order: "asc" },
    });
  }

  /**
   * Tạo một mẫu form mới trong hệ thống.
   * @param data Thông tin của form mới.
   * @param userId ID của người thực hiện tạo form.
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
   * Cập nhật thông tin của một mẫu form hiện có.
   * @param id ID của form cần cập nhật.
   * @param data Dữ liệu cập nhật mới.
   * @param userId ID của người thực hiện cập nhật.
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
   * Thực hiện xóa mềm (soft delete) một mẫu form khỏi hệ thống.
   * @param id ID của form cần xóa.
   * @param userId ID của người thực hiện thao tác xóa.
   */
  async deleteForm(id: string, userId?: string): Promise<any | null> {
    return this.formRepository.softDelete(id, {
      select: FormService.FORM_WITH_FIELDS_SELECT,
      updatedBy: userId,
    });
  }
}
