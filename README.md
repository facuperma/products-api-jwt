# API de productos con Node.js y Express

API REST para gestionar un catálogo de productos. Los datos se guardan en Firestore y las rutas que modifican información están protegidas con JWT.

Demo: https://proyecto-final-nodejs-fdg4.vercel.app

## Stack

- Node.js + Express 5
- Firebase / Firestore
- JSON Web Tokens (jsonwebtoken)
- dotenv, cors
- Deploy en Vercel

## Endpoints

| Método | Ruta | Auth | Descripción |
| --- | --- | --- | --- |
| POST | `/auth/login` | No | Devuelve un token válido por 1 hora |
| GET | `/api/products` | No | Lista los productos. Acepta `?category=` y `?price=` para filtrar |
| GET | `/api/products/:id` | No | Devuelve un producto por id |
| POST | `/api/products/create` | Sí | Crea un producto (o lo sobrescribe si el id ya existe) |
| DELETE | `/api/products/:id` | Sí | Elimina un producto |

Para las rutas protegidas hay que mandar el token en el header:

```
Authorization: Bearer <token>
```

Ejemplo para crear un producto:

```bash
curl -X POST http://localhost:3000/api/products/create \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"title": "Taladro percutor", "price": 85000, "category": "herramientas"}'
```

## Estructura

El código está separado en capas para que cada parte tenga una sola responsabilidad:

```
src/
  rutas/          definición de endpoints
  controladores/  validan la request y arman la respuesta
  servicios/      lógica de negocio (filtros, etc.)
  modelos/        acceso a Firestore
  middleware/     verificación del JWT
  data/           conexión a Firebase y generación de tokens
```

## Cómo correrlo

```bash
git clone https://github.com/facuperma/products-api-jwt.git
cd products-api-jwt
npm install
npm start
```

Antes hay que crear un archivo `.env` en la raíz con las credenciales del proyecto de Firebase y la clave para firmar los tokens:

```
apiKey=
authDomain=
projectId=
storageBucket=
messagingSenderId=
appId=
JWT_SECRET_KEY=
PORT=3000
```

## Pendientes

- Endpoint para actualizar productos (PUT)
- Usuarios guardados en base de datos en lugar del login fijo
- Tests

---

Facundo Peralta Marello · [GitHub](https://github.com/facuperma)
