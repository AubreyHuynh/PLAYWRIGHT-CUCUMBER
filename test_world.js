require("ts-node/register"); try { require("./src/fixtures/CustomWorld"); console.log("OK"); } catch(e) { console.error("ERR:", e.message); console.error(e.stack); }
