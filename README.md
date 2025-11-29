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

**Opción A - Desde MySQL Workbench:**
1. Abrir MySQL Workbench
2. Crear nueva conexión (localhost:3306)
3. Ejecutar estos comandos:

```sql
CREATE DATABASE nexus_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE nexus_db;
```

**Opción B - Desde terminal:**
```bash
mysql -u root -p
```
Luego ejecutar:
```sql
CREATE DATABASE nexus_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
exit;
```

### 3️⃣ Configurar Backend

#### a) Configurar credenciales de MySQL

Editar `nexus/src/main/resources/application.properties`:

```properties
# Cambiar estas líneas con tus credenciales de MySQL
spring.datasource.url=jdbc:mysql://localhost:3306/nexus_db?useSSL=false&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=TU_PASSWORD_DE_MYSQL
```

#### b) Instalar dependencias y ejecutar
```bash
cd nexus
./mvnw clean install
./mvnw spring-boot:run
```

**En Windows:** usar `mvnw.cmd` en lugar de `./mvnw`

El backend estará corriendo en `http://localhost:8080`

⚠️ **IMPORTANTE:** En este punto el backend está corriendo pero la base de datos está **VACÍA**. Las tablas se crean automáticamente, pero sin datos. Si pruebas `curl http://localhost:8080/api/games` verás un array vacío `[]`.

### 4️⃣ Importar Juegos a la Base de Datos ⚡ PASO CRÍTICO

**Este paso es OBLIGATORIO para que la aplicación muestre juegos.**

**Opción A - Usando el endpoint de importación (puede fallar):**
```bash
curl -X POST http://localhost:8080/api/games/import-steam
```
⚠️ Este método usa la API de RAWG y puede fallar. Si falla, usar Opción B.

**Opción B - Insertando manualmente con SQL (RECOMENDADO):**

Abrir una nueva terminal y ejecutar:
```bash
mysql -u root -p nexus_db < docs/insert_games.sql
```

O desde MySQL Workbench/cliente MySQL:
```sql
USE nexus_db;
-- Copiar y pegar el contenido completo de docs/insert_games.sql
```

**Verificar que se importaron:**
```bash
curl http://localhost:8080/api/games
```
Deberías ver un JSON con array de juegos (no vacío `[]`).

O desde MySQL:
```bash
mysql -u root -p -e "USE nexus_db; SELECT COUNT(*) FROM games;"
```
Debería mostrar 16 juegos.

### 5️⃣ Configurar Frontend

#### a) Instalar dependencias
```bash
cd frontend
npm install
```

#### b) Verificar variables de entorno

Verificar que `frontend/.env.development` contenga:
```env
VITE_API_URL=http://localhost:8080/api
```

#### c) Ejecutar
```bash
npm run dev
```

El frontend estará corriendo en `http://localhost:5173`

---

## ✅ Verificación

### Backend funcionando:
```bash
curl http://localhost:8080/api/games
# Debe devolver JSON con array de juegos
```

### Frontend funcionando:
Abrir navegador en `http://localhost:5173`
- Deberías ver el catálogo con las tarjetas de juegos
- La barra de búsqueda debe funcionar

---

## 🐛 Problemas Comunes

### ❌ Error: "Access denied for user 'root'@'localhost'"
**Solución:** Cambiar las credenciales en `application.properties`
```properties
spring.datasource.username=TU_USUARIO
spring.datasource.password=TU_PASSWORD
```

### ❌ Error: "Unknown database 'nexus_db'"
**Solución:** Crear la base de datos:
```sql
CREATE DATABASE nexus_db;
```

### ❌ Error: "Port 8080 is already in use"
**Solución:** Matar el proceso que usa el puerto:
```bash
# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:8080 | xargs kill -9
```

### ❌ Frontend muestra "No se encontraron juegos"
**Solución:** Importar juegos a la base de datos (ver paso 4)

### ❌ Error: "Data too long for column 'categories'"
**Solución:** Ejecutar este SQL:
```sql
USE nexus_db;
ALTER TABLE games 
MODIFY COLUMN categories TEXT,
MODIFY COLUMN genres TEXT,
MODIFY COLUMN description TEXT,
MODIFY COLUMN short_description TEXT;
```

### ❌ Error: "VITE_API_URL is not defined"
**Solución:** Verificar que existe `frontend/.env.development` con:
```
VITE_API_URL=http://localhost:8080/api
```

---

## 📁 Estructura del Proyecto

```
Nexus-Integrador/
├── nexus/                    # Backend (Spring Boot)
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/.../
│   │   │   │   ├── controller/
│   │   │   │   ├── domain/
│   │   │   │   ├── dto/
│   │   │   │   ├── repository/
│   │   │   │   ├── service/
│   │   │   │   └── security/
│   │   │   └── resources/
│   │   │       └── application.properties
│   │   └── test/
│   └── pom.xml
│
└── frontend/                 # Frontend (React + Vite)
    ├── src/
    │   ├── api/
    │   ├── components/
    │   ├── pages/
    │   └── styles/
    ├── .env.development
    └── package.json
```

---

## 🔑 Credenciales por Defecto

No hay usuarios creados por defecto. Para crear uno:

**Registrarse desde el frontend:**
1. Ir a `http://localhost:5173`
2. Hacer clic en "Registrarse" (si hay botón)
3. O usar el endpoint de registro:

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@nexus.com",
    "username": "admin",
    "password": "admin123",
    "fullName": "Administrador"
  }'
```

---

## 🛠️ Comandos Útiles

### Backend:
```bash
# Compilar
./mvnw clean install

# Ejecutar
./mvnw spring-boot:run

# Ejecutar tests
./mvnw test

# Limpiar y recompilar
./mvnw clean package
```

### Frontend:
```bash
# Instalar dependencias
npm install

# Desarrollo
npm run dev

# Build para producción
npm run build

# Preview de producción
npm run preview
```

### Base de Datos:
```bash
# Conectar a MySQL
mysql -u root -p

# Backup
mysqldump -u root -p nexus_db > backup.sql

# Restaurar
mysql -u root -p nexus_db < backup.sql

# Ver todas las tablas
mysql -u root -p -e "USE nexus_db; SHOW TABLES;"
```

---

## 🌐 URLs del Proyecto

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8080/api
- **Swagger UI:** http://localhost:8080/swagger-ui.html
- **MySQL:** localhost:3306

---

## 📝 Notas Importantes

1. **Siempre ejecutar el backend ANTES que el frontend**
2. **Importar juegos después de crear la base de datos**
3. **Verificar que MySQL esté corriendo antes de iniciar el backend**
4. **El puerto 8080 debe estar libre para el backend**
5. **El puerto 5173 debe estar libre para el frontend**

---

## 🤝 Soporte

Si encuentras algún problema:
1. Verificar que todos los requisitos estén instalados
2. Revisar los logs del backend en la consola
3. Revisar la consola del navegador (F12) para errores del frontend
4. Verificar que la base de datos tenga juegos (`SELECT COUNT(*) FROM games;`)

---

## 📄 Licencia

Este proyecto es para fines educativos.
