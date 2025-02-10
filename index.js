import { createServer } from "node:http";


const data = {
  users: [
    {
      name: "vasa",
    },
    { name: "petya" },
  ],
};

const server = createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
});

server.listen(3000, "127.0.0.1", () => {
  console.log("Listening on 127.0.0.1:3000");
});
