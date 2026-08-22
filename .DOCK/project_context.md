# Contexto del Proyecto - AppTest

Este archivo mantiene la documentación y el contexto general del proyecto `AppTest` para facilitar futuras integraciones y desarrollos.

## Arquitectura de la Aplicación

La aplicación es un proyecto móvil desarrollado con **React Native** y **Expo** (v54), que utiliza TypeScript de forma estricta y emplea el sistema de enrutamiento basado en archivos de **Expo Router**.

### Estructura de Directorios

- `app/`: Directorio principal de rutas de Expo Router.
  - `(tabs)/`: Agrupa la navegación principal por pestañas de la aplicación.
    - `index.tsx`: Pantalla principal de Tareas (Temática TODO).
    - `add.tsx`: Formulario para agregar una nueva tarea.
    - `categorias.tsx`: Gestión de categorías de tareas.
    - `status.tsx`: Estadísticas de progreso de tareas.
    - `nasa/`: [NUEVA SECCIÓN] Sub-navegador Stack para la API de la NASA.
  - `_layout.tsx`: Layout raíz que provee el contenedor de área segura (`SafeAreaProvider`) y un navegador Stack inicial.
- `services/`: Módulos de integración con servicios externos.
  - `nasaApi.ts`: [Fase 1] Módulo cliente de la API de NASA APOD con filtrado de imágenes y tipado.
- `storage.ts`: Módulo de almacenamiento local persistente que usa `@react-native-async-storage/async-storage` para gestionar el CRUD de tareas y categorías.

## Configuración y Estilo Visual

- **Paleta de Colores**:
  - Color activo (Tab y botones principales): `#2563eb` (Blue)
  - Color inactivo (Tab y bordes): `#94a3b8` / `#cbd5e1` / `#e2e8f0` (Slate)
  - Textos principales: `#0f172a` (Slate oscuro)
  - Fondos suaves: `#f8fafc` / `#f1f5f9` (Slate claro)
- **Biblioteca de Iconos**: `Ionicons` de `@expo/vector-icons`.
- **Carga de Imágenes**: `expo-image` para un renderizado y caché de alto rendimiento.

## Integraciones y Mejoras del Sistema

1. **Integración API de NASA**: Consumo del endpoint de Astronomy Picture of the Day (APOD) con filtrado estricto para renderizar únicamente elementos cuyo `media_type === 'image'`.
