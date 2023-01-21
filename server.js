import express from "express";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import morgan from "morgan";
import dontenv from "dotenv";
import router from "./router.js";
dontenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors("*"));
app.use(morgan("dev"));
app.use(express.static("public"));

app.use(router);

app.get("*", (_req, res) => {
  res.sendFile(join(__dirname, "public", "index.html"));
});

app.listen(3000, () =>
  console.log(`server is running on http://localhost:${3000}`)
);
