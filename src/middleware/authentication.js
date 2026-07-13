import jwt from 'jsonwebtoken';
import 'dotenv/config';

const secret_key = process.env.JWT_SECRET_KEY;

export const authentication = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        console.log("No hay token de autorización, no se puede ejecutar la acción");
        return res.status(401).json({ message: "No hay token de autorización, no se puede ejecutar la acción" });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
        console.log("No hay token de autorización, no se puede ejecutar la acción");
        return res.status(401).json({ message: "No hay token de autorización, no se puede ejecutar la acción" });
    }

    jwt.verify(token, secret_key, (err) => {
        if (err) {
            console.log("Token inválido, no se puede ejecutar la acción");
            return res.status(403).json({ message: "Token inválido, no se puede ejecutar la acción" });
        }
        next();
    });
}