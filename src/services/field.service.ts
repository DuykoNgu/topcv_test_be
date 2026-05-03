import { Prisma } from "../generated/prisma/client";
import { FieldRepository } from "../repository/field.repository";

export type FieldFull = any;

export class FieldService {
  constructor(private readonly fieldRepository: FieldRepository) {}

  private static readonly FIELD_PROJECTION: Prisma.FieldSelect = {
    id: true,
    formId: true,
    label: true,
    type: true,
    required: true,
    options: true,
    createdBy: true,
    updatedBy: true,
    createdAt: true,
    updatedAt: true,
  };

  /**
   * Truy vấn chi tiết một trường thông tin dựa trên ID.
   * @param id ID của trường cần lấy thông tin.
   */
  async getFieldById(id: string): Promise<any | null> {
    return this.fieldRepository.findById(id, {
      select: FieldService.FIELD_PROJECTION,
    });
  }

  /**
   * Tạo một trường thông tin mới cho một form cụ thể.
   * @param formId ID của form sở hữu trường này.
   * @param data Dữ liệu của trường mới.
   * @param userId ID của người thực hiện tạo.
   */
  async createField(formId: string, data: any, userId?: string): Promise<any> {
    if (data.formId && data.formId !== formId) {
      throw new Error("Form ID mismatch");
    }

    const fieldData = {
      ...data,
      formId,
      createdBy: userId,
      updatedBy: userId,
    };

    return this.fieldRepository.create(fieldData, {
      select: FieldService.FIELD_PROJECTION,
    });
  }

  /**
   * Cập nhật thông tin của một trường đã tồn tại.
   * @param formId ID của form chứa trường này.
   * @param fieldId ID của trường cần cập nhật.
   * @param data Dữ liệu cập nhật mới.
   * @param userId ID của người thực hiện cập nhật.
   */
  async updateField(formId: string, fieldId: string, data: any, userId?: string): Promise<any | null> {
    const existingField = await this.getFieldById(fieldId);
    if (!existingField) {
      throw new Error("Field not found");
    }
    if (existingField.formId !== formId) {
      throw new Error("Field does not belong to this form");
    }

    const fieldData = {
      ...data,
      updatedBy: userId,
    };

    return this.fieldRepository.update(fieldId, fieldData, {
      select: FieldService.FIELD_PROJECTION,
    });
  }

  /**
   * Thực hiện xóa mềm (soft delete) một trường khỏi form.
   * @param formId ID của form chứa trường này.
   * @param fieldId ID của trường cần xóa.
   * @param userId ID của người thực hiện xóa.
   */
  async deleteField(formId: string, fieldId: string, userId?: string): Promise<any | null> {
    const existingField = await this.getFieldById(fieldId);
    if (!existingField) {
      throw new Error("Field not found");
    }
    if (existingField.formId !== formId) {
      throw new Error("Field does not belong to this form");
    }

    return this.fieldRepository.softDelete(fieldId, {
      select: FieldService.FIELD_PROJECTION,
      updatedBy: userId,
    });
  }
}
