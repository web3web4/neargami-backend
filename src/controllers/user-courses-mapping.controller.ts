import { Request, Response } from "express";
import { UserCoursesMappingService } from "../services/user-courses-mapping.service";
import { CreateUserCoursesMappingDto, UpdateUserCoursesMappingDto } from "../dtos/user-courses-mapping.dto";
import { Inject, Service } from "typedi";
import { IUserCoursesMapping } from "@/interfaces/user-courses-mapping.interface";

@Service()
export class UserCoursesMappingController {
  constructor(@Inject(() => UserCoursesMappingService) private userCoursesMappingService: UserCoursesMappingService) {
    console.log("UserCoursesMappingService initialized");
  }
  public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const data: CreateUserCoursesMappingDto = req.body;
    try {
      const userCoursesMapping: CreateUserCoursesMappingDto = await this.userCoursesMappingService.create(data);
      res
        .status(200)
        .send(
          JSON.stringify({ data: userCoursesMapping, message: "created" }, (key, value) => (typeof value === "bigint" ? value.toString() : value)),
        );
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  public findAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userCoursesMappings = await this.userCoursesMappingService.findAll();
      res
        .status(200)
        .send(
          JSON.stringify({ data: userCoursesMappings, message: "findAll" }, (key, value) => (typeof value === "bigint" ? value.toString() : value)),
        );
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  public findOne = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    try {
      const userCoursesMapping = await this.userCoursesMappingService.findOne(+id);
      if (userCoursesMapping) {
        res
          .status(200)
          .send(
            JSON.stringify({ data: userCoursesMapping, message: "findOne" }, (key, value) => (typeof value === "bigint" ? value.toString() : value)),
          );
      } else {
        res.status(404).json({ message: "UserCoursesMapping not found" });
      }
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  public update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const id = BigInt(req.params.id);
    const data: UpdateUserCoursesMappingDto = req.body;
    try {
      const userCoursesMapping = await this.userCoursesMappingService.update(id, data);
      res
        .status(200)
        .send(
          JSON.stringify({ data: userCoursesMapping, message: "updated" }, (key, value) => (typeof value === "bigint" ? value.toString() : value)),
        );
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  public delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const id = BigInt(req.params.id);
    try {
      const userCoursesMapping = await this.userCoursesMappingService.delete(id);
      res
        .status(200)
        .send(
          JSON.stringify({ data: userCoursesMapping, message: "deleted" }, (key, value) => (typeof value === "bigint" ? value.toString() : value)),
        );
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };
}
