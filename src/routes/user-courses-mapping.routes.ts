import { Router } from "express";
import { UserCoursesMappingController } from "../controllers/user-courses-mapping.controller";
import { Service, Container } from "typedi";
import { Routes } from "@/interfaces/routes.interface";

@Service()
export class UserCoursesMapping implements Routes {
  public router = Router();
  public userCoursesMappingController = Container.get(UserCoursesMappingController);

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post("/user-courses-mappings", this.userCoursesMappingController.create);
    this.router.get("/user-courses-mappings", this.userCoursesMappingController.findAll);
    this.router.get("/user-courses-mappings/:id", this.userCoursesMappingController.findOne);
    this.router.put("/user-courses-mappings/:id", this.userCoursesMappingController.update);
    this.router.delete("/user-courses-mappings/:id", this.userCoursesMappingController.delete);
  }
}
