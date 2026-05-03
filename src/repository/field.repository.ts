import { Prisma } from "../generated/prisma/client";
import type { Field } from "../generated/prisma/client";
import prisma from "../services/prisma.service";

export class FieldRepository {
  async findById(
    id: string,
    options: {
      select?: Prisma.FieldSelect;
      include?: Prisma.FieldInclude;
    } = {},
  ): Promise<any | null> {
    const { select, include } = options;
    const query: any = { where: { id } };
    if (select) query.select = select;
    if (include) query.include = include;
    return prisma.field.findUnique(query);
  }

  async create(
    data: Prisma.FieldCreateInput,
    options: {
      select?: Prisma.FieldSelect;
      include?: Prisma.FieldInclude;
    } = {},
  ): Promise<any> {
    const { select, include } = options;
    const query: any = { data };
    if (select) query.select = select;
    if (include) query.include = include;
    return prisma.field.create(query);
  }

  async update(
    id: string,
    data: Prisma.FieldUpdateInput,
    options: {
      select?: Prisma.FieldSelect;
      include?: Prisma.FieldInclude;
    } = {},
  ): Promise<any> {
    const { select, include } = options;
    const query: any = { 
      where: { id }, 
      data: {
        ...data,
        version: { increment: 1 }
      } 
    };
    if (select) query.select = select;
    if (include) query.include = include;
    return prisma.field.update(query);
  }

  async softDelete(
    id: string,
    options: {
      select?: Prisma.FieldSelect;
      include?: Prisma.FieldInclude;
      updatedBy?: string;
    } = {},
  ): Promise<any> {
    const { select, include, updatedBy } = options;
    const query: any = { 
      where: { id }, 
      data: { 
        deleteFlag: true,
        version: { increment: 1 },
        ...(updatedBy && { updatedBy })
      } 
    };
    if (select) query.select = select;
    if (include) query.include = include;
    return prisma.field.update(query);
  }

  async hardDelete(id: string): Promise<Field> {
    return prisma.field.delete({ where: { id } });
  }
}
