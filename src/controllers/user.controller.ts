import { Request, Response } from "express";
import { UserService } from "../services/user.service";
import { ResponseHandler } from "../utils/response";

export class UserController {
  private userService = new UserService();

  /**
   * Đăng ký tài khoản người dùng mới.
   */
  async register(req: Request, res: Response) {
    const result = await this.userService.register(req.body);
    ResponseHandler.success(res, result, 201);
  }

  /**
   * Đăng nhập vào hệ thống.
   */
  async login(req: Request, res: Response) {
    const result = await this.userService.login(req.body);
    ResponseHandler.success(res, result, 200);
  }

  /**
   * Làm mới Access Token bằng Refresh Token.
   */
  async refreshToken(req: Request, res: Response) {
    const { refreshToken } = req.body;
    const result = await this.userService.refreshToken(refreshToken);
    ResponseHandler.success(res, result, 200);
  }

  /**
   * Đăng xuất khỏi hệ thống.
   */
  async logout(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) {
      throw new Error("User not authenticated");
    }
    const result = await this.userService.logout(userId);
    ResponseHandler.success(res, result, 200);
  }

  /**
   * Lấy danh sách tất cả người dùng (Admin).
   */
  async getAllUsers(req: Request, res: Response) {
    const users = await this.userService.getAllUsers();
    ResponseHandler.success(res, users, 200);
  }

  /**
   * Lấy thông tin chi tiết của một người dùng theo ID.
   */
  async getUserById(req: Request, res: Response) {
    const id = String(req.params.id);
    const user = await this.userService.getProfile(id);
    if (!user) {
      throw new Error("User not found");
    }
    ResponseHandler.success(res, user, 200);
  }



}