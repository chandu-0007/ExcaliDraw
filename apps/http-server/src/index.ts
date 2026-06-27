import Express from "express" 
import  cors from "cors" 
import rateLimit from "express-rate-limit"
import dotenv from "dotenv"
import UsersRouter from "./routers/router.users"
import AiRouter from "./routers/router.ai"
import cookieParse from "cookie-parser"
dotenv.config()
const port = process.env.PORT ; 
const app = Express(); 
app.use(Express.json())
app.use(cors({
    origin: "http://localhost:3000",
    credentials : true
}))
app.use(cookieParse())
app.use("/" , UsersRouter)
app.use("/",AiRouter)
app.get("/help", (req , res)=>{
    res.status(200).json({
     message : "helper router is called"
    })
})
app.listen(port , ()=>{
    console.log(`http-server is running on ${port}`)
})