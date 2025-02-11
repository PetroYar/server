import { createServer } from "node:http";
import mongoose from "mongoose";
import "dotenv/config";
const Schema = mongoose.Schema;

const MONGO_URI = process.env.MONGO_URI;

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
};
await connectDB();

const EntityPost = new Schema({
  name: { type: String, required: true },
  body: { type: String, required: true },
});

const Post = mongoose.model("Post", EntityPost);

const routes = {
  "/": () => {
    return JSON.stringify({ msg: "hello world" });
  },
  "posts/:id": async (_id) => {
    const post = await Post.findById(_id);
    if (!post) throw new Error("404");
    return JSON.stringify(post);
  },

  posts: async () => {
    const posts = await Post.find();
    return JSON.stringify(posts);
  },
  create: async () => {
    const post = await Post({
      name: "Name+" + Date.now(),
      body: "Body+" + Date.now(),
    });
    await post.save();
    return JSON.stringify(post);
  },
};

const getRoute = async (pathname) => {
  const [, route, param] = pathname.split("/");

  if (route === "" && routes["/"]) {
    return await routes["/"]();
  }

  if (param && routes[`${route}/:id`]) {
    return await routes[`${route}/:id`](param);
  }

  if (routes[route]) {
    return await routes[route](param);
  }

  throw new Error("404");
};

const server = createServer(async (req, res) => {
  const url = req.url ? new URL(req.url, `http://${req.headers.host}`) : null;
  try {
    const route = await getRoute(url?.pathname || "/");
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(route);
  } catch (error) {
    if (error.message === "404") {
      res.writeHead(404, { "Content-Type": "text/html" });
      res.end("<h1>404 Not Found</h1>");
    } else {
      console.error("Error:", error);
      res.writeHead(500, { "Content-Type": "text/html" });
      res.end("<h1>500 Internal Server Error</h1>");
    }
  }
});

server.listen(3000, "127.0.0.1", () => {
  console.log("Listening on 127.0.0.1:3000");
});
