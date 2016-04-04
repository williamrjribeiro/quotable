"use strict";

let express = require('express');

let app = express();
app.get("/", (req, res) => {
    res.send("Hello Quotable!\n");
}).listen(3000, () => console.log("Express Server listening on port 3000"));
