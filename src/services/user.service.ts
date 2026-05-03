import { Prisma } from "../generated/prisma/client";
import { UserRepository } from "../repository/user.repository";
import type { User } from "../generated/prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export class UserService {
  private userRepository = new UserRepository();

  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  validateRegister(data: {
    username?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }): void {
    if (!data) {
      throw { statusCode: 400, message: "Thiếu dữ liệu request body" };
    }

    const { username, email, password, confirmPassword } = data;

    if (!username || username.length < 3) {
      throw { statusCode: 400, message: "Username >= 3 ký tự" };
    }

    if (!email || !email.includes("@")) {
      throw { statusCode: 400, message: "Email không hợp lệ" };
    }

    if (!password || password.length < 6) {
      throw { statusCode: 400, message: "Password >= 6 ký tự" };
    }

    if (password !== confirmPassword) {
      throw { statusCode: 400, message: "Password không khớp" };
    }
  }

  validateLogin(data: { email?: string; password?: string }): void {
    if (!data) {
      throw { statusCode: 400, message: "Thiếu dữ liệu request body" };
    }
    const { email, password } = data;
    if (!email || !password) {
      throw { statusCode: 400, message: "Thiếu email hoặc password" };
    }
  }

  async register(data: {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) {
    this.validateRegister(data);
    const { username, email, password } = data;

    const [userNameExists, emailExists] = await Promise.all([
      this.userRepository.isUsernameTaken(username),
      this.userRepository.isEmailTaken(email),
    ]);

    if (userNameExists) {
      throw { statusCode: 409, message: "Username đã tồn tại" };
    }
    if (emailExists) {
      throw { statusCode: 409, message: "Email đã tồn tại" };
    }

    const passWordHash = await bcrypt.hash(password, 10);
    const user = await this.userRepository.createAccount(
      {
        username,
        email,
        passwordHash: passWordHash,
      },
      {
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          createdAt: true,
        },
      },
    );

    const token = this.generateToken(user);

    return { message: "User created successfully", data: { user, token } };
  }

  async login(data: { email: string; password: string }) {
    this.validateLogin(data);
    const { email, password } = data;

    const user = await this.userRepository.findByEmail(email, {
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
        passwordHash: true,
      },
    });

    if (!user) {
      throw { statusCode: 401, message: "Email hoặc password không đúng" };
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw { statusCode: 401, message: "Email hoặc password không đúng" };
    }

    const token = this.generateToken(user);
    const refreshToken = await this.storeRefreshToken(user.id, this.generateRefreshToken(user));

    return { message: "Login successful", data: { user, token, refreshToken } };
  }

  generateToken(user: User): string {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "15m" },
    );
  }

  generateRefreshToken(user: User): string {
    return jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || "refresh_secret",
      { expiresIn: "7d" },
    );
  }

  async storeRefreshToken(userId: string, refreshToken: string): Promise<string> {
    const tokenHash = await bcrypt.hash(refreshToken, 10);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await this.userRepository.createRefreshToken(userId, tokenHash, expiresAt);

    return refreshToken;
  }

  async refreshToken(refreshToken: string) {
    if (!refreshToken) {
      throw { statusCode: 400, message: "Refresh token is required" };
    }

    const tokenHash = await bcrypt.hash(refreshToken, 10);
    const storedToken = await this.userRepository.findRefreshToken(tokenHash);

    if (!storedToken) {
      throw { statusCode: 401, message: "Invalid refresh token", code: "INVALID_REFRESH_TOKEN" };
    }

    if (storedToken.revoked) {
      throw { statusCode: 401, message: "Refresh token has been revoked", code: "REFRESH_TOKEN_REVOKED" };
    }

    if (storedToken.expiresAt < new Date()) {
      throw { statusCode: 401, message: "Refresh token expired", code: "REFRESH_TOKEN_EXPIRED" };
    }

    await this.userRepository.revokeRefreshToken(tokenHash);

    const user = storedToken.user;
    const newAccessToken = this.generateToken(user);
    const newRefreshToken = await this.storeRefreshToken(user.id, this.generateRefreshToken(user));

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      expiresIn: 15 * 60,
    };
  }

  async logout(userId: string) {
    if (!userId) {
      throw { statusCode: 400, message: "User ID is required" };
    }

    await this.userRepository.revokeAllRefreshTokens(userId);
    return { message: "Logged out successfully" };
  }

  verifyToken(token: string): object {
    return jwt.verify(token, process.env.JWT_SECRET || "secret") as object;
  }

  async getProfile(userId: string) {
    const user = await this.userRepository.findById(userId, {
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw { statusCode: 404, message: "User not found" };
    }

    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return this.userRepository.findAll();
  }
}