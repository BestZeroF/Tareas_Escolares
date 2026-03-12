# `[ Proyecto Tareas Escolares ]`

> `~ $ ./iniciar_servidor.sh` <br>
> *Una API RESTful construida para la gestión y control de tareas escolares.*

---

## `>_ Descripción del Proyecto`

Este proyecto es una práctica universitaria enfocada en la creación de APIs utilizando la tecnología de **Node.js** y **Express**. Implementa un sistema estructurado para el manejo de rutas, conexión a base de datos y prácticas de desarrollo del lado del servidor.

---

## `>_ Backend: Herramientas y Librerías`

Para que cualquier desarrollador externo pueda replicar y levantar este proyecto en su propio entorno local, se utilizaron las siguientes dependencias. 

> **`console.log("Nota:");`** Una vez clonado el repositorio, asegúrate de ejecutar `npm install` en la terminal para descargar todas las librerías necesarias.

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

---

## `>_ Endpoints de la API`

A continuación se describen las rutas creadas para gestionar los diferentes módulos de la aplicación. *(Nota: Las rutas base dependen de cómo se hayan montado en el archivo principal `app.js`)*.

### `[ 🕒 /api/horarios ]`
| Endpoint | Método | Descripción |
| :--- | :---: | :--- |
| `/` | `POST` | Crear un nuevo horario |
| `/materia/:id_materia` | `GET` | Consultar el horario de una materia |
| `/` | `GET` | Consultar todos los horarios |
| `/:id` | `PUT` | Actualizar un horario por id |
| `/:id` | `DELETE` | Eliminar un horario por id |

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

### `[ 📅 /api/periodos ]`
| Endpoint | Método | Descripción |
| :--- | :---: | :--- |
| `/` | `POST` | Crear un nuevo periodo |
| `/` | `GET` | Listar los periodos del usuario |
| `/:id` | `GET` | Obtener un periodo específico por id |
| `/:id` | `PUT` | Actualizar un periodo |
| `/:id` | `DELETE` | Eliminar un periodo |

<br>

### `[ 📝 /api/tareas ]`
| Endpoint | Método | Descripción |
| :--- | :---: | :--- |
| `/` | `POST` | Crear una nueva tarea |
| `/` | `GET` | Obtener todas las tareas |
| `/:id` | `GET` | Obtener una tarea específica por id |
| `/:id` | `PUT` | Actualizar una tarea |
| `/:id/completar` | `PATCH` | Marcar una tarea como completada |
| `/:id` | `DELETE` | Eliminar una tarea |
| `/estado/pendientes` | `GET` | Consultar las tareas pendientes |
| `/estado/vencidas` | `GET` | Consultar las tareas vencidas |
| `/estado/completadas` | `GET` | Consultar las tareas completadas |

---

## `>_ Entorno de Desarrollo`

Este proyecto fue desarrollado y estructurado utilizando:

<br>

![Fedora](https://img.shields.io/badge/Fedora-2F4153?style=for-the-badge&logo=fedora&logoColor=white) &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ![NodeJS](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white) &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white) &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)

<br>

---

<code>zero@fedora:~/Tareas_Escolares$ exit</code> <br><br>
🎓 **Universidad:** Universidad Politécnica de Bacalar <br>
👨‍💻 **Desarrollador:** Gerardo Amaro Buitron <br>
📅 **Fecha:** 12 de Marzo de 2026
