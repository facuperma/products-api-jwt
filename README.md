# API de productos con Node.js y Express

API REST para gestionar un catálogo de productos. Los datos se guardan en Firestore y las rutas que modifican información están protegidas con JWT.

Demo: https://proyecto-final-nodejs-fdg4.vercel.app

## Stack

- Node.js + Express 5
- Firebase / Firestore
- JSON Web Tokens (jsonwebtoken)
- dotenv, cors
- Frontend en React + TypeScript con Vite
- Deploy en Vercel

## Endpoints

| Método | Ruta | Auth | Descripción |
| --- | --- | --- | --- |
| POST | `/auth/login` | No | Devuelve un token válido por 1 hora |
| GET | `/api/products` | No | Lista los productos. Acepta `?category=` y `?price=` para filtrar |
| GET | `/api/products/:id` | No | Devuelve un producto por id |
| POST | `/api/products/create` | Sí | Crea un producto (o lo sobrescribe si el id ya existe) |
| PUT | `/api/products/:id` | Sí | Actualiza los campos enviados de un producto |
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
scripts/
  seed.js         carga productos de muestra
frontend/         interfaz web (React + TypeScript)
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

Para cargar productos de muestra en Firestore: `npm run seed`.

## Interfaz frontend

La carpeta `frontend` contiene una interfaz React + TypeScript con Vite para consultar el catálogo. Iniciando sesión desde la página se pueden agregar, editar y eliminar productos.

1. En una terminal, iniciá la API desde la raíz con `npm start`.
2. En otra terminal, iniciá el frontend con `npm install --prefix frontend` y después `npm run dev --prefix frontend`.
3. Abrí la dirección que muestra Vite (por defecto, `http://localhost:5173`).

Durante el desarrollo, Vite reenvía las solicitudes `/auth` y `/api` al backend en `http://localhost:3000`. Si la API usa otro puerto, actualizá el destino del proxy en `frontend/vite.config.ts`.

## Pendientes

- Usuarios guardados en base de datos en lugar del login fijo
- Tests

---

Facundo Peralta Marello
