import { server } from "./app";
import { createUser } from "./routes/auth/create-user";

server.register(createUser)

server.listen({
  port: 3333,
  host: '0.0.0.0'
})
  .then(() => console.log('Server is running on port 3333'))