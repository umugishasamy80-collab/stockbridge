const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));

app.use((req, res) => {
    res.sendFile(
        path.join(__dirname, "public", "index.html")
    );
});
app.get("/admin", (req, res) => {
    res.sendFile(
        path.join(__dirname, "public", "admin", "index.html")
    );
});
app.listen(PORT, () => {
    console.log("");
    console.log("================================");
    console.log("       STOCKLINK WEB");
    console.log("================================");
    console.log(`Website: http://localhost:${PORT}`);
    console.log("Frontend: READY");
    console.log("================================");
});