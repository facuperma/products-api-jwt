console.log("Programa iniciado...");
import express from 'express'; 
import cors from 'cors';
import loginRouter from './src/rutas/auth.routes.js';
import productsRouter from './src/rutas/products.routes.js';
import 'dotenv/config';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: ["*"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));


app.use(express.json({
  verify: (req, res, buf) => {
    try { req.rawBody = buf.toString(); } catch(e){ req.rawBody = undefined; }
  }
}));
app.use(express.urlencoded({ extended: true }));


app.use((req, res, next) => {
    console.log(`Datos recibidos: ${req.method} ${req.url}`);
    console.log("Headers:", req.headers);
    if (req.rawBody) console.log("Raw body:", req.rawBody);
    console.log("Parsed body:", req.body);
    next();
});

app.use("/auth", loginRouter);

app.use((err, req, res, next) => {
  if (err && err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error('JSON inválido:', err.message);
    return res.status(400).json({ message: 'JSON inválido en el body' });
  }
  next(err);
});

app.use('/api', productsRouter);
   
app.use(function(req, res, next) {
    res.status(404)
    res.send('Página no encontrada')
});

// En Vercel la app se usa como función serverless; localmente levantamos el servidor.
if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Servidor corriendo en http://localhost:${PORT}`)
    })
}

export default app;
