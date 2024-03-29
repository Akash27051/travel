import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  database: "world",
  host: "localhost",
  port: 5432,
  password: "root"
})

db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let country_visited2 = [];

async function country_visited1() {
  const result = await db.query("SELECT country_code FROM visited_countries");
  let country_visited = result.rows;
  console.log(country_visited);

  for (let i = 0; i < country_visited.length; i++) {
    country_visited2[i] = country_visited[i].country_code;

  }
  console.log(country_visited2);

}

app.get("/", async (req, res) => {
  await country_visited1();

  res.render("index.ejs", { total: country_visited2.length, countries: country_visited2 })
  console.log("hello Akash");
});


// handling "/add" post request

app.post("/add", async (req, res) => {

  let cname = req.body.country;
  console.log(cname);
  try {
    let result = await db.query("SELECT country_code FROM countries WHERE LOWER(country_name) LIKE '%'||$1||'%' ", [cname.toLowerCase()]);
    console.log(result.rows);
    console.log(result.rows[0].country_code);
    
    try {
      if (result.rows.length !== 0) {

        let nCountry = result.rows[0].country_code;
        await db.query("INSERT INTO visited_countries (country_code) VALUES ($1)", [nCountry]);

        res.redirect("/");
      }

    } catch (error1) {
      console.error("Hey, already exist error occured", error1.stack);
      await country_visited1();
      console.log(country_visited2.length)
      res.render("index.ejs", { error: "Entered country already exist, Please try again.", total: country_visited2.length, countries: country_visited2 });
    }

  } catch (error) {
    console.error("Hey, Some error occured", error.stack);
    await country_visited1();
    res.render("index.ejs", { error: "Entered country does not exist, Please try again.", total: country_visited2.length, countries: country_visited2 });

  }



});




app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
