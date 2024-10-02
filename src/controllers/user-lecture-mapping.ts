import { Request, Response } from "express";
import { UserLectureMappingService } from "../services/user-lecture-mapping.service";
import { CreateUserLectureMappingDto, UpdateUserLectureMappingDto } from "../dtos/user-lecture-mapping.dto";
import { Inject, Service } from "typedi";
import { IUserLectureMapping } from "@/interfaces/user-lecture-mapping.interface";

@Service()
export class UserLectureMappingController {
  constructor(@Inject(() => UserLectureMappingService) private userLectureMappingService: UserLectureMappingService) {
    console.log("UserLectureMappingService initialized");
  }
  public create = async (req: Request, res: Response, next: Function): Promise<void> => {
    const data: CreateUserLectureMappingDto = req.body;
    try {
      const userCreateLectures: IUserLectureMapping = await this.userLectureMappingService.create(data);
      //   //const userLecturesMappings: any ("lecture_id"):string = userCreateLectures.lecture_id.toString();
      //     const userLCreateLectures = userCreateLectures.toString();
      //     const lecture_id = userCreateLectures.lecture_id.toString();
      //     const id=userCreateLectures.
      res
        .status(200)
        .send(
          JSON.stringify({ data: userCreateLectures, message: "created" }, (key, value) => (typeof value === "bigint" ? value.toString() : value)),
        );
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  public findAll = async (req: Request, res: Response, next: Function): Promise<void> => {
    try {
      const findAll: IUserLectureMapping[] = await this.userLectureMappingService.findAll();
      const userLecturesMappings = findAll.map(userLectureMapping => ({
        ...userLectureMapping,
        id: userLectureMapping.id.toString(),
        lecture_id: userLectureMapping.lecture_id.toString(),
        user_courses_mapping_id: userLectureMapping.user_courses_mapping_id.toString(),
      }));

      res
        .status(200)
        .send(
          JSON.stringify({ data: userLecturesMappings, message: "findAll" }, (key, value) => (typeof value === "bigint" ? value.toString() : value)),
        );
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  public findOne = async (req: Request, res: Response, next: Function): Promise<void> => {
    const id = BigInt(req.params.id);
    try {
      const userLectureMapping: IUserLectureMapping = await this.userLectureMappingService.findOne(id);
      if (userLectureMapping) {
        res
          .status(200)
          .send(
            JSON.stringify({ data: userLectureMapping, message: "findOne" }, (key, value) => (typeof value === "bigint" ? value.toString() : value)),
          );
      } else {
        res.status(404).json({ message: "userLectureMapping not found" });
      }
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  public update = async (req: Request, res: Response, next: Function): Promise<void> => {
    const id = BigInt(req.params.id);
    const data: UpdateUserLectureMappingDto = req.body;
    try {
      const userLectureMapping = await this.userLectureMappingService.update(id, data);
      res
        .status(200)
        .send(
          JSON.stringify({ data: userLectureMapping, message: "updated" }, (key, value) => (typeof value === "bigint" ? value.toString() : value)),
        );
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  public delete = async (req: Request, res: Response, next: Function): Promise<void> => {
    const id = BigInt(req.params.id);
    try {
      const userLectureMapping = await this.userLectureMappingService.delete(id);
      res
        .status(200)
        .send(
          JSON.stringify({ data: userLectureMapping, message: "delete" }, (key, value) => (typeof value === "bigint" ? value.toString() : value)),
        );
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };
}
