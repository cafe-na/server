import { server } from "./app";
import { getAddress } from "./routes/address/get-address";
import { updateAddress } from "./routes/address/update-address";
import { createUser } from "./routes/auth/create-user";
import { getProfile } from "./routes/auth/get-profile";
import { updateProfile } from "./routes/auth/update-profile";
import { createCheckout } from "./routes/checkout/create-checkout";

server.register(createUser)
server.register(getProfile)
server.register(updateProfile)
server.register(updateAddress)
server.register(getAddress)
server.register(createCheckout)

server.listen({
  port: 3333,
  host: '0.0.0.0'
})
  .then(() => console.log('Server is running on port 3333'))
