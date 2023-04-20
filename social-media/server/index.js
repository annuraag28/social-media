const express = require('express');
const dotenv = require('dotenv');
const dbConnect = require('./dbConnect');
dotenv.config("./.env");
const authRouter = require('./router/authRouter');
const postsRouter = require('./router/postsRouter');
const userRouter = require('./router/userRouter');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const morgan = require('morgan');

const app = express();

app.use(express.json());
app.use(morgan('common'));
app.use(cookieParser());
app.use(cors({
    credentials: true,
    origin: "http://localhost:3000"
}))

app.use('/auth', authRouter);
app.use('/posts', postsRouter);
app.use('/user',userRouter);
app.get('/',(req,res)=>{
    res.status(200).send("Ok from server");
});

const PORT = process.env.PORT || 4001;

dbConnect();
app.listen(PORT, ()=>{
    console.log(`listening on port: ${PORT}`);
});



