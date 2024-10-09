import { Router } from "express";
import { UserLectureMappingController } from "../controllers/user-lecture-mapping";
import { Service, Container } from "typedi";
import { Routes } from "@/interfaces/routes.interface";

@Service()
export class UserLecturesMapping implements Routes {
  public router = Router();
  public userLectureMappingController = Container.get(UserLectureMappingController);

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post("/user-lecture-mappings", this.userLectureMappingController.create);
    this.router.get("/user-lecture-mappings", this.userLectureMappingController.findAll);
    this.router.get("/user-lecture-mappings/:id", this.userLectureMappingController.findOne);
    this.router.put("/user-lecture-mappings/:id", this.userLectureMappingController.update);
    this.router.delete("/user-lecture-mappings/:id", this.userLectureMappingController.delete);
  }
}
