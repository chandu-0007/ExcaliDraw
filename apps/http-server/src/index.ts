import Express from "express" 
import  cors from "cors" 
import rateLimit from "express-rate-limit"
import dotenv from "dotenv"
import UsersRouter from "./routers/router.users"
import auth from "./middleware/auth"
import cookieParse from "cookie-parser"
dotenv.config()
const port = process.env.PORT ; 
const app = Express(); 
app.use(Express.json())
app.use(cors())
app.use(cookieParse())
app.use(rateLimit({
    max : 3 
}))
app.use("/" , UsersRouter)
app.get("/help",auth, (req , res)=>{
    res.status(200).json({
     message : "helper router is called"
    })
})
app.listen(port , ()=>{
    console.log(`http-server is running on ${port}`)
})