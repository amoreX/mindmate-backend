const express = require("express");
const io = require("socket.io")(4001, {
	cors: { origin: "*" },
});
const app = express();
const port = 8080;

app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});
app.get("/", (req, res) => {
	res.send("Hello");
});

io.on("connection", (socket) => {
	console.log("user connected");

	socket.on("message", (data) => {
		const { username, message } = data;
		console.log(username, message);
		io.emit("message", `${username}: ${message}`);
	});
});
