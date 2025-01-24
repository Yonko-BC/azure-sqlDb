import { Request, Response } from "express";
import { UserRepository } from "../repositories/user.repository";
import { User } from "../models/user.model";

export class UserController {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const userData: User = {
        name: req.body.name,
        email: req.body.email,
      };

      if (!userData.name || !userData.email) {
        res.status(400).json({ error: "Name and email are required" });
        return;
      }

      const user = await this.userRepository.create(userData);
      res.status(201).json(user);
    } catch (error) {
      console.error("Create user error:", error);
      res.status(500).json({ error: "Failed to create user" });
    }
  };

  findAll = async (_req: Request, res: Response): Promise<void> => {
    try {
      const users = await this.userRepository.findAll();
      res.json(users);
    } catch (error) {
      console.error("Find all users error:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  };

  findById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ error: "Invalid user ID" });
        return;
      }

      const user = await this.userRepository.findById(id);
      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }
      res.json(user);
    } catch (error) {
      console.error("Find user by ID error:", error);
      res.status(500).json({ error: "Failed to fetch user" });
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ error: "Invalid user ID" });
        return;
      }

      const updateData: Partial<User> = {
        name: req.body.name,
        email: req.body.email,
      };

      if (!updateData.name && !updateData.email) {
        res
          .status(400)
          .json({
            error: "At least one field (name or email) is required for update",
          });
        return;
      }

      const user = await this.userRepository.update(id, updateData);
      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }
      res.json(user);
    } catch (error) {
      console.error("Update user error:", error);
      res.status(500).json({ error: "Failed to update user" });
    }
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ error: "Invalid user ID" });
        return;
      }

      const success = await this.userRepository.delete(id);
      if (!success) {
        res.status(404).json({ error: "User not found" });
        return;
      }
      res.status(204).send();
    } catch (error) {
      console.error("Delete user error:", error);
      res.status(500).json({ error: "Failed to delete user" });
    }
  };
}
