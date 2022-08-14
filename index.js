const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
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

app.listen(port, () => {
  console.log(`Filmrare app listening at http://localhost:${port}`);
});
