import { Prisma } from "../generated/prisma/client";
import type { Submission } from "../generated/prisma/client";
import prisma from "../services/prisma.service";

export class SubmissionRepository {
  async findAll(
    options: {
      select?: Prisma.SubmissionSelect;
      where?: Prisma.SubmissionWhereInput;
      orderBy?: Prisma.SubmissionOrderByWithRelationInput;
    } = {},
  ): Promise<any[]> {
    const { select, where, orderBy } = options;
    const query: any = { where, ...(select && { select }) };
    if (orderBy) query.orderBy = orderBy;
    return prisma.submission.findMany(query);
  }

  async findById(
    id: string,
    options: {
      select?: Prisma.SubmissionSelect;
      include?: Prisma.SubmissionInclude;
    } = {},
  ): Promise<any | null> {
    const { select, include } = options;
    const query: any = { where: { id } };
    if (select) query.select = select;
    if (include) query.include = include;
    return prisma.submission.findUnique(query);
  }

  async findWithDetails(
    options: {
      select?: Prisma.SubmissionSelect;
      include?: Prisma.SubmissionInclude;
      where?: Prisma.SubmissionWhereInput;
      orderBy?: Prisma.SubmissionOrderByWithRelationInput;
    } = {},
  ): Promise<any[]> {
    const { select, include, where, orderBy } = options;

    if (select) {
      return prisma.submission.findMany({
        where: { deleteFlag: false, ...where },
        orderBy: orderBy ?? { submittedAt: "desc" },
        select,
      });
    }

    const defaultInclude: Prisma.SubmissionInclude = {
      form: {
        select: {
          id: true,
          title: true,
          description: true,
          order: true,
          status: true,
          version: true,
          createdBy: true,
          updatedBy: true,
          deleteFlag: true,
          createdAt: true,
          updatedAt: true,
        },
      },
      user: {
        select: {
          id: true,
          username: true,
          name: true,
          email: true,
        },
      },
      values: {
        select: {
          id: true,
          fieldId: true,
          value: true,
          version: true,
          createdBy: true,
          updatedBy: true,
          deleteFlag: true,
          createdAt: true,
          updatedAt: true,
          field: {
            select: {
              id: true,
              formId: true,
              label: true,
              type: true,
              order: true,
              required: true,
              options: true,
              validationRules: true,
              version: true,
              createdBy: true,
              updatedBy: true,
              deleteFlag: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
      },
    };

    const mergedInclude = include ? { ...defaultInclude, ...include } : defaultInclude;

    return prisma.submission.findMany({
      where: { deleteFlag: false, ...where },
      orderBy: orderBy ?? { submittedAt: "desc" },
      include: mergedInclude,
    });
  }

  async create(
    data: Prisma.SubmissionCreateInput,
    options: {
      select?: Prisma.SubmissionSelect;
      include?: Prisma.SubmissionInclude;
    } = {},
  ): Promise<any> {
    const { select, include } = options;
    const query: any = { data };
    if (select) query.select = select;
    if (include) query.include = include;
    return prisma.submission.create(query);
  }

  async update(
    id: string,
    data: Prisma.SubmissionUpdateInput,
    options: {
      select?: Prisma.SubmissionSelect;
      include?: Prisma.SubmissionInclude;
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
    return prisma.submission.update(query);
  }

  async softDelete(
    id: string,
    options: {
      select?: Prisma.SubmissionSelect;
      include?: Prisma.SubmissionInclude;
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
    return prisma.submission.update(query);
  }

  async hardDelete(id: string): Promise<Submission> {
    return prisma.submission.delete({ where: { id } });
  }
}
