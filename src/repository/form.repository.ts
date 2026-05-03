import { Prisma } from "../generated/prisma/client";
import type { Form } from "../generated/prisma/client";
import prisma from "../services/prisma.service";

export class FormRepository {
  async findAll(
    options?: {
      select?: Prisma.FormSelect;
      where?: Prisma.FormWhereInput;
      orderBy?: Prisma.FormOrderByWithRelationInput;
    },
  ): Promise<any[]> {
    const { select, where, orderBy } = options || {};
    const query: any = {
      where: { ...where, deleteFlag: false },
      ...(select && { select }),
      orderBy: orderBy ?? { order: "asc" },
    };
    return prisma.form.findMany(query);
  }

  async findWithPagination(
    skip: number,
    take: number,
    options: {
      select?: Prisma.FormSelect;
      where?: Prisma.FormWhereInput;
      orderBy?: Prisma.FormOrderByWithRelationInput;
    } = {},
  ): Promise<{ data: any[]; total: number }> {
    const { select, where, orderBy } = options;
    const [data, total] = await Promise.all([
      prisma.form.findMany({
        where: { ...where, deleteFlag: false },
        skip,
        take,
        ...(select && { select }),
        orderBy: orderBy ?? { order: "asc" },
      }),
      prisma.form.count({
        where: { ...where, deleteFlag: false },
      }),
    ]);
    return { data, total };
  }

  async findById(
    id: string,
    options: {
      select?: Prisma.FormSelect;
      include?: Prisma.FormInclude;
    } = {},
  ): Promise<any | null> {
    const { select, include } = options;
    const query: any = { where: { id } };
    if (select) query.select = select;
    if (include) query.include = include;
    return prisma.form.findUnique(query);
  }

  async findActiveForSubmission(
    options: {
      select?: Prisma.FormSelect;
      include?: Prisma.FormInclude;
      orderBy?: Prisma.FormOrderByWithRelationInput;
    } = {},
  ): Promise<any[]> {
    const { select, include, orderBy } = options;
    const query: any = {
      where: { status: "ACTIVE", deleteFlag: false },
      ...(select && { select }),
      ...(include && { include }),
      orderBy: orderBy ?? { order: "asc" },
    };
    return prisma.form.findMany(query);
  }

  async create(
    data: Prisma.FormCreateInput,
    options: {
      select?: Prisma.FormSelect;
      include?: Prisma.FormInclude;
    } = {},
  ): Promise<any> {
    const { select, include } = options;
    const query: any = { data };
    if (select) query.select = select;
    if (include) query.include = include;
    return prisma.form.create(query);
  }

  async update(
    id: string,
    data: Prisma.FormUpdateInput,
    options: {
      select?: Prisma.FormSelect;
      include?: Prisma.FormInclude;
    } = {},
  ): Promise<any> {
    const { select, include } = options;
    const query: any = { 
      where: { id }, 
      data: { 
        ...data,
        version: { increment: 1 } // Tự động tăng version
      } 
    };
    if (select) query.select = select;
    if (include) query.include = include;
    return prisma.form.update(query);
  }

  async softDelete(
    id: string,
    options: {
      select?: Prisma.FormSelect;
      include?: Prisma.FormInclude;
      updatedBy?: string;
    } = {},
  ): Promise<any> {
    const { select, include, updatedBy } = options;
    const query: any = { 
      where: { id }, 
      data: { 
        deleteFlag: true,
        version: { increment: 1 }, // Tăng cả khi xóa mềm
        ...(updatedBy && { updatedBy })
      } 
    };
    if (select) query.select = select;
    if (include) query.include = include;
    return prisma.form.update(query);
  }

  async hardDelete(id: string): Promise<Form> {
    return prisma.form.delete({ where: { id } });
  }
}
