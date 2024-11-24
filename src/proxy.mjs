import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
const port = 4000;

// Install required dependencies:
// npm install express cors node-fetch
// Need to run node src/proxy.mjs to start the server
// The server will be running at http://localhost:4000
// key will be used to access the LeetCode API using src.crx and src.pem (DON'T COMMIT THIS!)

app.use(cors()); // Enable CORS for all routes
app.use(express.static("src")); // Serve static files from the src folder

app.use(express.json());

app.post("/leetcode", async (req, res) => {
    const { query, variables } = req.body;

    try {
        const response = await fetch("https://leetcode.com/graphql/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query, variables }),
        });
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error("Error forwarding request:", error);
        res.status(500).send("Error communicating with LeetCode API");
    }
});

app.listen(port, () => {
    console.log(`Proxy server running at http://localhost:${port}`);
});
