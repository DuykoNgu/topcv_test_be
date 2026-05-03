import { FormRepository } from "../repository/form.repository";
import { FieldRepository } from "../repository/field.repository";
import { SubmissionRepository } from "../repository/submission.repository";

export const repositoryFactory = {
  createFormRepository: (): FormRepository => new FormRepository(),
  createFieldRepository: (): FieldRepository => new FieldRepository(),
  createSubmissionRepository: (): SubmissionRepository => new SubmissionRepository(),
};
