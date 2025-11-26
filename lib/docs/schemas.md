# Workout App Schema Documentation

Este directorio contiene los esquemas Zod que definen la estructura de datos y validaciones para la aplicación Workout App.

## Estructura de Datos y Relaciones

### Usuario y Perfil

- **profiles**: Información del perfil de usuario.
  - Contiene datos personales, preferencias de entrenamiento y objetivos.
  - Es la entidad principal que se relaciona con la mayoría de otras entidades.

### Grupos Musculares

- **muscle-group.ts**: Define grupos musculares anatómicos.
  - Pueden ser predefinidos (`is_default = true`) o creados por usuarios.
  - Se usan para categorizar ejercicios y definir enfoques de entrenamiento.
  - **Relaciones**:
    - Utilizados por ejercicios (many-to-many)
    - Priorizados en mesociclos (many-to-many)
    - Priorizados en plantillas de mesociclos (many-to-many)

### Ejercicios

- **exercise.ts**: Define ejercicios de entrenamiento.
  - Cada ejercicio tiene un grupo muscular primario y opcionalmente grupos secundarios.
  - Pueden ser predefinidos (`is_default = true`) o creados por usuarios.
  - **Relaciones**:
    - Tienen un grupo muscular primario (one-to-many)
    - Tienen grupos musculares secundarios (many-to-many a través de `exercise_muscle_groups`)
    - Son utilizados en sesiones de entrenamiento (many-to-many)
    - Son registrados en logs de ejercicios (one-to-many)

### Mesociclos

- **mesocycle.ts**: Define períodos de entrenamiento con objetivos específicos.
  - Representan un plan de entrenamiento para un período determinado (ej. 4-8 semanas).
  - **Relaciones**:
    - Pertenecen a un usuario (many-to-one)
    - Tienen múltiples objetivos (one-to-many con `mesocycle_goals`)
    - Tienen múltiples focos en grupos musculares (one-to-many con `mesocycle_muscle_group_focus`)
    - Contienen múltiples sesiones de entrenamiento (one-to-many con `training_sessions`)

### Sesiones de Entrenamiento

- **training-session.ts**: Define una sesión de entrenamiento dentro de un mesociclo.
  - Representa un entrenamiento planificado para un día específico.
  - **Relaciones**:
    - Pertenece a un mesociclo (many-to-one)
    - Contiene múltiples ejercicios a través de `session_exercises` (one-to-many)
    - Puede estar vinculada a registros de entrenamiento (one-to-many)

### Plantillas

- **mesocycle-template.ts** y **session-template.ts**: Definen plantillas reutilizables.
  - Permiten crear planes de entrenamiento predefinidos que pueden ser utilizados por múltiples usuarios.
  - **Relaciones**:
    - Las plantillas de mesociclo contienen plantillas de sesiones (one-to-many)
    - Las plantillas de sesión contienen ejercicios (one-to-many a través de `template_session_exercises`)

### Registro de Actividad

- **workout-log.ts**: Registra entrenamientos completados.

  - **Relaciones**:
    - Pertenece a un usuario (many-to-one)
    - Opcionalmente asociado a un mesociclo (many-to-one)
    - Opcionalmente asociado a una sesión de entrenamiento (many-to-one)
    - Contiene múltiples logs de ejercicios (one-to-many)

- **Mediciones y Progreso**:
  - **measurement.ts**: Registra mediciones corporales a lo largo del tiempo.
  - Permite hacer seguimiento del progreso físico.

## Patrones Comunes de Campos

La mayoría de las entidades incluyen estos campos estándar:

- `id`: UUID para identificación única
- `created_at` y `updated_at`: Marcas de tiempo para auditoría
- `user_id` (cuando aplica): Para identificar al propietario/creador

## Seguridad y Acceso

- Los elementos con `is_default = true` son visibles para todos los usuarios
- Los elementos con un `user_id` específico solo son accesibles para ese usuario
- La aplicación implementa Row Level Security (RLS) a nivel de base de datos para garantizar el aislamiento de datos

## Flujo de Datos Típico

1. Usuario crea un **mesociclo** con objetivos específicos
2. Dentro del mesociclo, crea múltiples **sesiones de entrenamiento**
3. Añade **ejercicios** a cada sesión
4. Registra los entrenamientos completados en **workout_logs**
5. Realiza seguimiento del progreso con **measurements**
