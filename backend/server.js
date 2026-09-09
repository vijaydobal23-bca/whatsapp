import "dotenv/config";

import app from "./src/app.js";
import { config } from "./src/config/config.js";
import {connectDb} from "./src/config/db.js";


 

const PORT = config.PORT;
connectDb();

app.listen(PORT,()=>{
  console.log(`The server is starting on port ${PORT}`);
})