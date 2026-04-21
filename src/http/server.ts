import { server } from "./app";
import { createUser } from "./routes/auth/create-user";
import { getProfile } from "./routes/auth/get-profile";
import { updateProfile } from "./routes/auth/update-profile";
import { createCheckout } from "./routes/create-checkout";

server.register(createUser)
server.register(getProfile)
server.register(updateProfile)
server.register(createCheckout)

server.listen({
  port: 3333,
  host: '0.0.0.0'
})
  .then(() => console.log('Server is running on port 3333'))
