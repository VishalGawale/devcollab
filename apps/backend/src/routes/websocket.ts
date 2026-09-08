import { FastifyInstance } from "fastify";

export async function websocketRoutes(app: FastifyInstance) {
  // WebSocket route for real-time updates
  app.get("/ws/updates", { websocket: true }, (socket) => {
    console.log("Client connected to WebSocket");

    // Send welcome message
    socket.send(
      JSON.stringify({
        type: "connected",
        message: "WebSocket connected to DevCollab",
        timestamp: new Date().toISOString(),
      }),
    );

    // Handle messages from client
    socket.on("message", (message: string) => {
      try {
        const data = JSON.parse(message);
        console.log("Received:", data);

        // Echo back for testing
        socket.send(
          JSON.stringify({
            type: "echo",
            data: data,
            timestamp: new Date().toISOString(),
          }),
        );
      } catch (err) {
        console.error("Invalid message format");
      }
    });

    // Handle disconnect
    socket.on("close", () => {
      console.log("Client disconnected");
    });
  });
}
