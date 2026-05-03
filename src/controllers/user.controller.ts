import { Request, Response } from "express";
import { UserService } from "../services/user.service";

export class UserController {
  private userService = new UserService();

  async register(req: Request, res: Response) {
    try {
      const result = await this.userService.register(req.body);
      res.status(201).json(result);
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ error: error.message || "Registration failed" });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const result = await this.userService.login(req.body);
      res.json(result);
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ error: error.message || "Login failed" });
    }
  }

  async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;
      const result = await this.userService.refreshToken(refreshToken);
      res.json(result);
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ error: error.message || "Token refresh failed" });
    }
  }

  async logout(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const result = await this.userService.logout(userId);
      res.json(result);
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ error: error.message || "Logout failed" });
    }
  }


  async getAllUsers(req: Request, res: Response) {
    try {
      const users = await this.userService.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  }

  async getUserById(req: Request, res: Response) {
    try {
      const id = String(req.params.id);
      const user = await this.userService.getProfile(id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  }

  async createUser(req: Request, res: Response) {
    try {
      const user = await this.userService.register(req.body);
      res.status(201).json(user);
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ error: error.message || "Failed to create user" });
    }
  }

  async updateUser(req: Request, res: Response) {
    try {
      const id = String(req.params.id);
      const user = await this.userService.getProfile(id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to update user" });
    }
  }

  async deleteUser(req: Request, res: Response) {
    try {
      const id = String(req.params.id);
      await this.userService.getProfile(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete user" });
    }
  }
}