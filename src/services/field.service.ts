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
   * Lấy field theo ID với đầy đủ thông tin
   */
  async getFieldById(id: string): Promise<any | null> {
    return this.fieldRepository.findById(id, {
      select: FieldService.FIELD_PROJECTION,
    });
  }

  /**
   * Tạo field mới và trả về field với đầy đủ thông tin
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
   * Cập nhật field theo ID và trả về field đã cập nhật
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
   * Xóa mềm field theo ID và trả về field đã xóa
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
