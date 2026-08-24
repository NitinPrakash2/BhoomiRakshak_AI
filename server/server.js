const app = require("./app");
const config = require("./config");

app.listen(config.port, () => {
  console.log(`[server] BhoomiRakshak API listening on port ${config.port} (${config.env})`);
});
