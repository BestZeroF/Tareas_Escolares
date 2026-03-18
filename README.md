# `[ Proyecto Tareas Escolares ]`

> `~ $ ./iniciar_plataforma.sh` <br>
> *Una plataforma Full-Stack construida para la gestión, organización y control de tareas y horarios escolares.*

---

## `>_ Descripción del Proyecto`

Este proyecto es una práctica universitaria enfocada en el desarrollo Full-Stack. Por el lado del servidor, implementa una API RESTful utilizando **Node.js** y **Express** conectada a PostgreSQL. Por el lado del cliente, presenta una interfaz gráfica interactiva, moderna y responsiva construida con **React** y **Tailwind CSS**.

---

## `>_ Stack Tecnológico`

Para que cualquier desarrollador externo pueda replicar y levantar este proyecto en su propio entorno local, se utilizaron las siguientes dependencias. 

> **`console.log("Nota:");`** Una vez clonado el repositorio, asegúrate de ejecutar `npm install` tanto en la carpeta del backend como en la del frontend para descargar todas las librerías necesarias.

### `[ Backend ]`
| Herramienta / Librería | Versión | Propósito / Descripción |
| :--- | :---: | :--- |
| **Node.js** | `Entorno` | Entorno de ejecución de JavaScript en el servidor. |
| **Express** | `^5.2.1` | Framework minimalista para la creación y manejo de rutas de la API. |
| **pg** | `^8.20.0` | Cliente de PostgreSQL para la conexión e interacción con la base de datos. |
| **bcrypt** | `^6.0.0` | Librería encargada del hasheo y encriptación segura de contraseñas. |
| **jsonwebtoken** | `^9.0.3` | Generación y validación de tokens JWT para la autenticación de usuarios. |
| **cors** | `^2.8.6` | Middleware para habilitar y gestionar peticiones de origen cruzado (CORS). |
| **dotenv** | `^17.3.1` | Carga de variables de entorno (como credenciales de BD) desde el archivo `.env`. |
| **nodemon** | `^3.1.14` | `[Dev]` Herramienta que reinicia el servidor al detectar cambios. |

### `[ Frontend ]`
| Herramienta / Librería | Propósito / Descripción |
| :--- | :--- |
| **Vite + React** | Entorno de desarrollo ultrarrápido y librería base para la interfaz de usuario. |
| **Tailwind CSS v4** | Framework de CSS utilitario para el diseño responsivo. |
| **Axios** | Cliente HTTP para la comunicación asíncrona con la API REST. |
| **React Router DOM** | Enrutamiento dinámico para construir una Single Page Application (SPA). |
| **Lucide React** | Paquete de iconos vectoriales modernos para la interfaz gráfica. |

---

## `>_ Características de la Interfaz (UI/UX)`

* 🌗 **Modo Oscuro Integrado:** Cambio dinámico de tema (Light/Dark) con persistencia en `localStorage`.
* 📊 **Dashboard Interactivo:** Resumen de productividad, barra de progreso y agenda filtrada al día actual.
* 📅 **Línea de Tiempo (Timeline):** Vista de periodos escolares en un diagrama de Gantt organizado por meses.
* 🗂️ **Gestor de Horarios Seguro:** Calendario visual con algoritmo de detección y prevención de choques de materias.
* ✅ **Tareas Rápidas:** Marcado de tareas completadas en tiempo real (Toggle) e insignias de estado (Atrasada, Hoy, Lista).

---

## `>_ Endpoints de la API`

A continuación se describen las rutas creadas para gestionar los diferentes módulos de la aplicación. 

### `[ 🔐 /api/auth ]`
| Endpoint | Método | Descripción |
| :--- | :---: | :--- |
| `/register` | `POST` | Registrar un nuevo usuario en la base de datos. |
| `/login` | `POST` | Autenticar usuario y generar token JWT de acceso. |

<br>

### `[ 📅 /api/periodos ]`
| Endpoint | Método | Descripción |
| :--- | :---: | :--- |
| `/` | `POST` | Crear un nuevo periodo |
| `/` | `GET` | Listar los periodos del usuario logueado |
| `/:id` | `GET` | Obtener un periodo específico por id |
| `/:id` | `PUT` | Actualizar un periodo |
| `/:id` | `DELETE` | Eliminar un periodo |

<br>

### `[ 📚 /api/materias ]`
| Endpoint | Método | Descripción |
| :--- | :---: | :--- |
| `/` | `POST` | Crear una nueva materia |
| `/` | `GET` | Listar todas las materias |
| `/:id_periodo` | `GET` | Listar materias por periodo |
| `/detalle/:id` | `GET` | Obtener detalle de una materia |
| `/:id` | `PUT` | Actualizar una materia |
| `/:id` | `DELETE` | Eliminar una materia |

<br>

### `[ 🕒 /api/horarios ]`
| Endpoint | Método | Descripción |
| :--- | :---: | :--- |
| `/` | `POST` | Crear un nuevo bloque de horario |
| `/materia/:id_materia` | `GET` | Consultar el horario de una materia |
| `/` | `GET` | Consultar todos los horarios |
| `/:id` | `PUT` | Actualizar un horario por id |
| `/:id` | `DELETE` | Eliminar un horario por id (Borrado seguro) |

<br>

### `[ 📝 /api/tareas ]`
| Endpoint | Método | Descripción |
| :--- | :---: | :--- |
| `/` | `POST` | Crear una nueva tarea |
| `/` | `GET` | Obtener todas las tareas |
| `/:id` | `GET` | Obtener una tarea específica por id |
| `/:id` | `PUT` | Actualizar una tarea |
| `/:id/completar` | `PATCH` | Marcar o desmarcar una tarea como completada (Toggle) |
| `/:id` | `DELETE` | Eliminar una tarea |
| `/estado/pendientes` | `GET` | Consultar las tareas pendientes |
| `/estado/vencidas` | `GET` | Consultar las tareas vencidas |
| `/estado/completadas` | `GET` | Consultar las tareas completadas |

---

## `>_ Entorno de Desarrollo`

Este proyecto fue desarrollado y estructurado utilizando:

<br>

<div align="center">
  <img src="https://img.shields.io/badge/Fedora-2F4153?style=for-the-badge&logo=fedora&logoColor=white" height="45"> &nbsp;&nbsp;&nbsp;&nbsp;
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" height="45"> &nbsp;&nbsp;&nbsp;&nbsp;
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" height="45"> &nbsp;&nbsp;&nbsp;&nbsp;
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" height="45"> &nbsp;&nbsp;&nbsp;&nbsp;
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" height="45"> &nbsp;&nbsp;&nbsp;&nbsp;
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" height="45">
</div>

<br>

---

<code>zero@fedora:~/Tareas_Escolares$ exit</code> <br><br>
🎓 **Universidad:** Universidad Politécnica de Bacalar <br>
👨‍💻 **Desarrollador:** Gerardo Amaro Buitron <br>
📅 **Fecha:** 17 de Marzo de 2026
