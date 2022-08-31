const express = require("express");
const app = express();
const cors = require('cors');
const filmrare_routes = require("./routes/filmrare_routes");
const stripe_routes = require("./routes/stripe_routes");

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.get("/", (req, res) => {
  res.json({ message: "API Connection OK" });
});

app.use(cors({
  origin: '*'
}));

app.use("/api/filmrare", filmrare_routes);
app.use("/api/stripe", stripe_routes);


/* Error handler middleware */
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  console.error(err.message, err.stack);
  res.status(statusCode).json({ message: err.message });
  return;
});

app.listen(process.env.PORT || 4000, () => {
  console.log(`Filmrare app listening`);
});
