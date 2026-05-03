import prisma from "../services/prisma.service";
import { Prisma } from "../generated/prisma/client";
import type { User, RefreshToken } from "../generated/prisma/client";

export class UserRepository {
  async findAll(): Promise<User[]> {
    return prisma.user.findMany();
  }

  async findById(id: string, options?: { select?: Prisma.UserSelect }): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
      select: options?.select,
    });
  }

  async findByEmail(email: string, options?: { select?: Prisma.UserSelect }): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
      select: options?.select,
    });
  }

  async isUsernameTaken(username: string): Promise<boolean> {
    const user = await prisma.user.findUnique({ where: { username } });
    return !!user;
  }

  async isEmailTaken(email: string): Promise<boolean> {
    const user = await prisma.user.findUnique({ where: { email } });
    return !!user;
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return prisma.user.create({ data });
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return prisma.user.update({ where: { id }, data });
  }

  async delete(id: string): Promise<User> {
    return prisma.user.delete({ where: { id } });
  }

  async createAccount(data: {
    username: string;
    email: string;
    passwordHash: string;
  }, options?: { select?: Prisma.UserSelect }): Promise<User> {
    return prisma.user.create({
      data: {
        username: data.username,
        name: data.username,
        email: data.email,
        passwordHash: data.passwordHash,
      },
      select: options?.select,
    });
  }

  async createRefreshToken(userId: string, tokenHash: string, expiresAt: Date): Promise<RefreshToken> {
    return prisma.refreshToken.create({
      data: {
        tokenHash,
        userId,
        expiresAt,
      },
    });
  }

  async findRefreshToken(tokenHash: string): Promise<(RefreshToken & { user: User }) | null> {
    return prisma.refreshToken.findFirst({
      where: { tokenHash },
      include: { user: true },
    });
  }

  async revokeRefreshToken(tokenHash: string): Promise<void> {
    await prisma.refreshToken.updateMany({
      where: { tokenHash },
      data: { revoked: true },
    });
  }

  async revokeAllRefreshTokens(userId: string): Promise<void> {
    await prisma.refreshToken.updateMany({
      where: { userId, revoked: false },
      data: { revoked: true },
    });
  }
}