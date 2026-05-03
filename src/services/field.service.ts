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
  async createField(data: Prisma.FieldCreateInput): Promise<any> {
    return this.fieldRepository.create(data, {
      select: FieldService.FIELD_PROJECTION,
    });
  }

  /**
   * Cập nhật field theo ID và trả về field đã cập nhật
   */
  async updateField(id: string, data: Prisma.FieldUpdateInput): Promise<any | null> {
    return this.fieldRepository.update(id, data, {
      select: FieldService.FIELD_PROJECTION,
    });
  }

  /**
   * Xóa mềm field theo ID và trả về field đã xóa
   */
  async deleteField(id: string, updatedBy?: string): Promise<any | null> {
    return this.fieldRepository.softDelete(id, {
      select: FieldService.FIELD_PROJECTION,
      updatedBy,
    });
  }
}
