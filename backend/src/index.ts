import { createApp } from "./app.js";
import { config } from "./config.js";

const app = createApp();

app.listen(config.port, () => {
  console.log(`API listening on http://localhost:${config.port}`);
  console.log(`Proxying upstream: ${config.upstreamBaseUrl}`);
});
