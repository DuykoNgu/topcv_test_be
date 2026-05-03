import { FormService } from "../services/form.service";
import { FieldService } from "../services/field.service";
import { SubmissionService } from "../services/submission.service";
import { repositoryFactory } from "./repository.factory";

export const serviceFactory = {
  createFormService: (): FormService => {
    return new FormService(
      repositoryFactory.createFormRepository()
    );
  },
  createFieldService: (): FieldService => {
    return new FieldService(
      repositoryFactory.createFieldRepository()
    );
  },
  createSubmissionService: (): SubmissionService => {
    return new SubmissionService(
      repositoryFactory.createSubmissionRepository()
    );
  },
};
