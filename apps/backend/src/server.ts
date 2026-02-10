import Fastify from "fastify";

const app = Fastify({ logger: true });

app.get("/health", async () => ({ status: "ok" }));

app.listen({ port: 3002 }, (err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log("Server running at http://localhost:3001");
});
