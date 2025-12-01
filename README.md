# 🎮 Nexus Marketplace - Guía de Instalación

Marketplace de videojuegos con Spring Boot + React + MySQL

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Java 21** o superior ([Descargar](https://www.oracle.com/java/technologies/downloads/))
- **Node.js 18+** y npm ([Descargar](https://nodejs.org/))
- **MySQL 8.0+** ([Descargar](https://dev.mysql.com/downloads/mysql/))
- **Git** ([Descargar](https://git-scm.com/))

### Verificar instalaciones:
```bash
java -version    # Debe mostrar Java 21
node -v          # Debe mostrar v18 o superior
npm -v           # Debe mostrar versión de npm
mysql --version  # Debe mostrar MySQL 8.0+
```

---

## 🚀 Instalación

### 1️⃣ Clonar el Repositorio
```bash
git clone <URL_DEL_REPOSITORIO>
cd Nexus-Integrador
```

### 2️⃣ Configurar Base de Datos

**Opción A - Importar desde archivo SQL (RECOMENDADO):**
```bash
mysql -u root -p < nexusintegrator.sql
```

**Opción B - Crear base de datos vacía:**
```sql
CREATE DATABASE nexus_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3️⃣ Ejecutar Script de Nuevas Tablas

Después de crear la base de datos, ejecuta el script para biblioteca y pagos:
```bash
mysql -u root -p nexus_db < nexus/src/main/resources/db/migration/V2__add_library_and_payments.sql
```

### 4️⃣ Configurar Backend

Editar `nexus/src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/nexus_db?useSSL=false&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=TU_PASSWORD_DE_MYSQL
```

Ejecutar:
```bash
cd nexus
./mvnw clean install
./mvnw spring-boot:run
```
**En Windows:** usar `mvnw.cmd` en lugar de `./mvnw`

### 5️⃣ Configurar Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 🌐 URLs del Proyecto

| Servicio | URL |
|----------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8080/api |
| Swagger UI | http://localhost:8080/swagger-ui.html |
| MySQL | localhost:3306 |

---

## 📚 API Endpoints

### 🔐 Autenticación
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/register` | Registrar usuario |
| POST | `/api/auth/login` | Iniciar sesión |
| GET | `/api/auth/me` | Usuario actual |

### 🎮 Juegos
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/games` | Todos los juegos |
| GET | `/api/games/featured` | Juegos destacados |
| GET | `/api/games/category/{category}` | Por categoría |
| GET | `/api/games/platform/{platform}` | Por plataforma |
| GET | `/api/games/{id}` | Detalle de juego |
| GET | `/api/games/{id}/screenshots` | Screenshots |

### 🛒 Carrito
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/cart` | Ver carrito |
| POST | `/api/cart/add` | Agregar juego |
| PUT | `/api/cart/items/{id}` | Actualizar cantidad |
| DELETE | `/api/cart/items/{id}` | Eliminar item |
| DELETE | `/api/cart/clear` | Vaciar carrito |

### 📦 Órdenes
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/orders/checkout` | Crear orden |
| GET | `/api/orders/my-orders` | Mis órdenes |
| GET | `/api/orders/{id}` | Detalle de orden |
| POST | `/api/orders/{id}/cancel` | Cancelar orden |

### 💳 Pagos
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/payments/card` | Pagar con tarjeta |
| POST | `/api/payments/yape/generate-qr` | Generar QR Yape |
| POST | `/api/payments/yape/confirm` | Confirmar pago Yape |
| GET | `/api/payments/methods` | Métodos disponibles |

### 📚 Biblioteca
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/library` | Mis juegos |
| GET | `/api/library/stats` | Estadísticas |
| GET | `/api/library/owns/{gameId}` | ¿Tengo este juego? |
| POST | `/api/library/{gameId}/install` | Instalar juego |

### ⭐ Reviews
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/reviews/game/{gameId}` | Reviews de un juego |
| GET | `/api/reviews/game/{gameId}/stats` | Estadísticas |
| POST | `/api/reviews` | Crear review |
| POST | `/api/reviews/{id}/helpful` | Marcar útil |

### 💬 Comunidad
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/community/posts` | Ver posts |
| POST | `/api/community/posts` | Crear post |
| POST | `/api/community/posts/{id}/like` | Dar like |
| POST | `/api/community/posts/{id}/comments` | Comentar |

### ❤️ Favoritos
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/user/favorites` | Mis favoritos |
| POST | `/api/user/favorites/{gameId}` | Agregar favorito |
| DELETE | `/api/user/favorites/{gameId}` | Quitar favorito |

---

## 💳 Datos de Prueba para Pagos

### Tarjetas de Prueba

#### ✅ Tarjetas que APRUEBAN el pago:

| Marca | Número | CVV | Vencimiento |
|-------|--------|-----|-------------|
| VISA | 4111 1111 1111 1111 | 123 | 12/2025 |
| VISA | 4242 4242 4242 4242 | 456 | 06/2026 |
| Mastercard | 5555 5555 5555 4444 | 789 | 03/2027 |
| Mastercard | 5105 1051 0510 5100 | 321 | 09/2025 |
| AMEX | 3782 822463 10005 | 1234 | 12/2026 |

#### ❌ Tarjeta que RECHAZA el pago (para probar errores):
| Marca | Número | CVV | Vencimiento |
|-------|--------|-----|-------------|
| VISA | 4000 0000 0000 0002 | 123 | 12/2025 |

**Nombre del titular:** Cualquier nombre (ej: "JUAN PEREZ")

### Ejemplo de pago con tarjeta:
```json
POST /api/payments/card
{
  "orderId": 1,
  "paymentMethod": "CREDIT_CARD",
  "cardNumber": "4111111111111111",
  "cardHolder": "JUAN PEREZ",
  "expiryMonth": "12",
  "expiryYear": "2025",
  "cvv": "123"
}
```

---

### 📱 Pago con Yape (Simulado)

#### Paso 1: Generar QR
```json
POST /api/payments/yape/generate-qr?orderId=1

Respuesta:
{
  "paymentCode": "PAY-A1B2C3D4",
  "amount": 59.99,
  "qrCodeBase64": "...",
  "qrCodeData": "YAPE|PAY-A1B2C3D4|59.99|NEXUS_MARKETPLACE",
  "expiresAt": "2024-12-01T15:30:00",
  "expiresInSeconds": 900,
  "instructions": "1. Abre tu app de Yape..."
}
```

#### Paso 2: Confirmar pago (simula que el usuario pagó)
```json
POST /api/payments/yape/confirm?paymentCode=PAY-A1B2C3D4

Respuesta:
{
  "status": "COMPLETED",
  "message": "¡Pago con Yape confirmado! Los juegos han sido agregados a tu biblioteca."
}
```

**Nota:** En producción, la confirmación vendría de un webhook de Yape. En este entorno de desarrollo, el usuario debe llamar manualmente al endpoint de confirmación.

---

## 🔄 Flujo Completo de Compra

```
┌─────────────────────────────────────────────────────────────────┐
│                    FLUJO DE COMPRA                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. AGREGAR AL CARRITO                                          │
│     POST /api/cart/add { gameId: 1, quantity: 1 }               │
│                          ↓                                       │
│  2. CREAR ORDEN                                                  │
│     POST /api/orders/checkout { paymentMethod: "PENDING" }      │
│     → Orden creada con status: PENDING                          │
│                          ↓                                       │
│  3. ELEGIR MÉTODO DE PAGO                                       │
│     ┌──────────────────┬──────────────────────┐                 │
│     │   💳 TARJETA     │    📱 YAPE           │                 │
│     ├──────────────────┼──────────────────────┤                 │
│     │ POST /payments/  │ POST /payments/yape/ │                 │
│     │ card             │ generate-qr          │                 │
│     │                  │        ↓             │                 │
│     │                  │ Usuario escanea QR   │                 │
│     │                  │        ↓             │                 │
│     │                  │ POST /payments/yape/ │                 │
│     │                  │ confirm              │                 │
│     └────────┬─────────┴──────────┬───────────┘                 │
│              ↓                    ↓                              │
│  4. PAGO EXITOSO                                                 │
│     → Orden status: COMPLETED                                    │
│     → Juegos agregados a BIBLIOTECA                             │
│                          ↓                                       │
│  5. VER BIBLIOTECA                                              │
│     GET /api/library                                            │
│     → Lista de juegos adquiridos                                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔑 Usuarios de Prueba

| Usuario | Email | Password | Rol |
|---------|-------|----------|-----|
| carlos | carlosenriqueruizllanterhuay@gmail.com | (ver BD) | ADMIN |
| usuario1 | correo@prueba.com | (ver BD) | USER |

Para crear un nuevo usuario:
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@nexus.com",
    "username": "testuser",
    "password": "Test123!",
    "fullName": "Usuario de Prueba"
  }'
```

---

## 🐛 Problemas Comunes

### ❌ Error: "Access denied for user 'root'@'localhost'"
**Solución:** Cambiar las credenciales en `application.properties`

### ❌ Error: "Unknown database 'nexus_db'"
**Solución:** Crear la base de datos:
```sql
CREATE DATABASE nexus_db;
```

### ❌ Error: "Table 'user_library' doesn't exist"
**Solución:** Ejecutar el script de migración:
```bash
mysql -u root -p nexus_db < nexus/src/main/resources/db/migration/V2__add_library_and_payments.sql
```

### ❌ Error: "Port 8080 is already in use"
**Solución:** 
```bash
# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F
```

---

## 📁 Estructura del Proyecto

```
Nexus-Integrador/
├── nexus/                          # Backend (Spring Boot)
│   └── src/main/java/.../
│       ├── controller/             # REST Controllers
│       │   ├── AuthController
│       │   ├── GameController
│       │   ├── CartController
│       │   ├── OrderController
│       │   ├── PaymentController   # 💳 Pagos
│       │   ├── LibraryController   # 📚 Biblioteca
│       │   ├── ReviewController
│       │   └── CommunityController
│       ├── domain/                 # Entidades JPA
│       ├── dto/                    # Data Transfer Objects
│       ├── repository/             # JPA Repositories
│       ├── service/                # Lógica de negocio
│       └── security/               # JWT + Spring Security
│
└── frontend/                       # Frontend (React + Vite)
    └── src/
        ├── api/                    # Axios config
        ├── components/             # Componentes React
        ├── pages/                  # Páginas
        └── hooks/                  # Custom hooks
```

---

## 📝 Notas Importantes

1. **Siempre ejecutar el backend ANTES que el frontend**
2. **Ejecutar los scripts SQL en orden**
3. **Los pagos son SIMULADOS** - No se conecta a pasarelas reales
4. **El QR de Yape es simulado** - En producción se integraría con la API real de Yape

---

## 📄 Licencia

Este proyecto es para fines educativos.
