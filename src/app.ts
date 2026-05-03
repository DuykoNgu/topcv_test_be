import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import userRoutes from "./routes/user.routes";
import formRoutes from "./routes/form.routes";
import fieldRoutes from "./routes/field.routes";
import { submissionRouter, formSubmitRouter } from "./routes/submission.routes";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger";
import { globalErrorHandler } from "./middleware/error.middleware";


const app = express();
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({ message: "Welcome to TOPCV Test API" });
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));


app.use("/api/forms", formRoutes); 
app.use("/api/forms", fieldRoutes);
app.use("/api/forms", formSubmitRouter); 
app.use("/api/submissions", submissionRouter);

app.use("/api", userRoutes);

app.use(globalErrorHandler);
export default app;
