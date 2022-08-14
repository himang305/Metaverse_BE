const express = require("express");
const app = express();
const filmrare_routes = require("./routes/filmrare_routes");

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.get("/", (req, res) => {
  res.json({ message: "API Connection OK" });
});

app.use("/filmrare", filmrare_routes);

/* Error handler middleware */
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  console.error(err.message, err.stack);
  res.status(statusCode).json({ message: err.message });
  return;
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`Filmrare app listening`);
});
