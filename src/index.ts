
import express from 'express';
import { dbConnect } from './db_connect/db';
import usersRoute from './routes/web/userRoutes';
import cors from 'cors';


const app = express();
const PORT = 3000;
app.use(express.json());
app.use(cors());




app.use("/web/api/v1", usersRoute)

app.listen(PORT, async () => {
  await dbConnect();
  console.log(`Server running at http://localhost:${PORT}`);
});
