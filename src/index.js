//imports
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { sequelize } = require("./config/db");
const corsOptions = require("./config/corsOptions");
const errorHandler = require("./middlewares/errorHandler");
const morgan = require("morgan");
require("./models/User");
require("./models/Operation");

//Initializations
const app = express();

//Middelwares
app.use(morgan("dev"));
app.use(cors(corsOptions));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());

//Routes
app.use("/api/auth", require("./routes/public.routes"));
app.use("/api/user", require("./routes/private.routes"));
app.use("/api/op", require("./routes/operation.routes"));

//Error handler
app.use(errorHandler);

//Server & DB connection
const PORT = process.env.PORT || 4000;
async function mainServer() {
  try {
    await sequelize.sync({ force: false });
    server = app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
    console.log("DB is connected");
  } catch (err) {
    console.error("Unable to connect to the database:", err);
  }
}

mainServer();

//unhandledRejection prettier
process.on("unhandledRejection", (err, promise) => {
  console.log(`Logged error: ${err}`);
  server.close(() => {
    process.exit(1);
  });
});
