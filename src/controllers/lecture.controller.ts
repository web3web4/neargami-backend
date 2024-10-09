import { NextFunction, Request, Response } from "express";
import { LectureService } from "../services/lecture.service";
import { CreateLectureDto, UpdateLectureDto } from "../dtos/lecture.dto";
import { Inject, Service } from "typedi";
import { ILecture } from "@/interfaces/lecture.interface";

@Service()
export class LectureController {
  constructor(@Inject(() => LectureService) private lectureService: LectureService) {
    console.log("LectureController initialized");
  }

  public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const data: CreateLectureDto = req.body;
    try {
      const lecture = await this.lectureService.create(data);
      res
        .status(200)
        .send(JSON.stringify({ data: lecture, message: "created" }, (key, value) => (typeof value === "bigint" ? value.toString() : value)));
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  public findAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const lectures: ILecture[] = await this.lectureService.findAll();
      const processedLectures = lectures.map(lecture => ({
        ...lecture,
        id: lecture.id.toString(),

        // Assuming 'id' is a BigInt field
      }));

      res
        .status(200)
        .send(
          JSON.stringify({ data: processedLectures, message: "findAll" }, (key, value) => (typeof value === "bigint" ? value.toString() : value)),
        );
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  public findOne = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const id = BigInt(req.params.id);
    try {
      const lecture = await this.lectureService.findOne(id);
      if (lecture) {
        res
          .status(200)
          .send(JSON.stringify({ data: lecture, message: "found" }, (key, value) => (typeof value === "bigint" ? value.toString() : value)));
      } else {
        res.status(404).json({ message: "Lecture not found" });
      }
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  public update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const id = BigInt(req.params.id);
    const data: UpdateLectureDto = req.body;
    try {
      const lecture = await this.lectureService.update(id, data);
      res
        .status(200)
        .send(JSON.stringify({ data: lecture, message: "updated" }, (key, value) => (typeof value === "bigint" ? value.toString() : value)));
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  public delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const id = BigInt(req.params.id);
    try {
      const lecture = await this.lectureService.delete(id);
      res
        .status(200)
        .send(JSON.stringify({ data: lecture, message: "deleted" }, (key, value) => (typeof value === "bigint" ? value.toString() : value)));
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };
}
