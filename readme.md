# Flota Somyl - App Conductor (Móvil)

Aplicación móvil nativa para conductores de la flota, desarrollada con **React Native** y **Expo**. Permite la gestión de viajes, registro de evidencia fotográfica y rastreo GPS en tiempo real.

## 📋 Características Principales

* **Autenticación Segura:** Login conectado al backend Flask (JWT), restringido al rol "Conductor".
* **Gestión de Viajes:**
    * Visualización de viajes asignados (Pendientes) y en curso.
    * **Inicio de Ruta:** Registro de odómetro inicial, observaciones y **foto de evidencia** (subida a Supabase Storage).
    * **Rastreo GPS:** Captura automática de coordenadas en segundo plano mientras el viaje está activo.
    * **Cierre de Ruta:** Validación de kilometraje final y observaciones de cierre.
* **Historial:** Consulta de viajes finalizados con visualización de la ruta realizada en mapa interactivo.
* **Modo Offline (Parcial):** Interfaz optimizada para condiciones de movilidad.

## 🛠 Tech Stack

* **Framework:** React Native (Expo SDK 50+).
* **Lenguaje:** JavaScript (ES6+).
* **Navegación:** React Navigation (Bottom Tabs).
* **Mapas:** `react-native-maps` (Google Maps / Apple Maps).
* **Cámara/Fotos:** `expo-image-picker`.
* **Ubicación:** `expo-location`.
* **Backend:** API Flask (Python) alojada en Railway.
* **Almacenamiento:** Supabase Storage (para fotos).
* **Base de Datos:** Supabase (PostgreSQL).
* **Build System:** EAS (Expo Application Services) para generar APKs.

## 🚀 Instalación y Configuración

### 1. Prerrequisitos
Asegúrate de tener instalado:
* [Node.js](https://nodejs.org/) (LTS recomendado).
* Expo CLI: `npm install -g expo-cli` (o usar `npx expo`).
* EAS CLI (para builds): `npm install -g eas-cli`.

### 2. Clonar e Instalar Dependencias
```bash
git clone <URL_DEL_REPOSITORIO>
cd flota_app
npm install

4. Configuración de la API
La URL del backend se define en config.js. Asegúrate de que apunte a tu servidor de producción o desarrollo según corresponda

// Archivo: config.js
export const API_BASE_URL = '[https://flota.datix.cl/](https://flota.datix.cl/)';

# Iniciar servidor (limpiando caché para asegurar carga de .env)
npx expo start -c

Flotas Somyl.
Gem personalizado
¡Excelente idea! Documentar es fundamental, especialmente en aplicaciones móviles donde la configuración del entorno (Expo, EAS, claves) es crítica.

Aquí tienes una propuesta completa y profesional para el archivo README.md de tu proyecto flota_app. Está diseñada para que cualquier programador (o tú mismo en el futuro) pueda clonar el proyecto, configurarlo y entender cómo funciona en minutos.

Crea un archivo llamado README.md en la raíz de tu carpeta flota_app y pega el siguiente contenido:

Markdown
# Flota Somyl - App Conductor (Móvil)

Aplicación móvil nativa para conductores de la flota, desarrollada con **React Native** y **Expo**. Permite la gestión de viajes, registro de evidencia fotográfica y rastreo GPS en tiempo real.

## 📋 Características Principales

* **Autenticación Segura:** Login conectado al backend Flask (JWT), restringido al rol "Conductor".
* **Gestión de Viajes:**
    * Visualización de viajes asignados (Pendientes) y en curso.
    * **Inicio de Ruta:** Registro de odómetro inicial, observaciones y **foto de evidencia** (subida a Supabase Storage).
    * **Rastreo GPS:** Captura automática de coordenadas en segundo plano mientras el viaje está activo.
    * **Cierre de Ruta:** Validación de kilometraje final y observaciones de cierre.
* **Historial:** Consulta de viajes finalizados con visualización de la ruta realizada en mapa interactivo.
* **Modo Offline (Parcial):** Interfaz optimizada para condiciones de movilidad.

## 🛠 Tech Stack

* **Framework:** React Native (Expo SDK 50+).
* **Lenguaje:** JavaScript (ES6+).
* **Navegación:** React Navigation (Bottom Tabs).
* **Mapas:** `react-native-maps` (Google Maps / Apple Maps).
* **Cámara/Fotos:** `expo-image-picker`.
* **Ubicación:** `expo-location`.
* **Backend:** API Flask (Python) alojada en Railway.
* **Almacenamiento:** Supabase Storage (para fotos).
* **Base de Datos:** Supabase (PostgreSQL).
* **Build System:** EAS (Expo Application Services) para generar APKs.

## 🚀 Instalación y Configuración

### 1. Prerrequisitos
Asegúrate de tener instalado:
* [Node.js](https://nodejs.org/) (LTS recomendado).
* Expo CLI: `npm install -g expo-cli` (o usar `npx expo`).
* EAS CLI (para builds): `npm install -g eas-cli`.

### 2. Clonar e Instalar Dependencias
```bash
git clone <URL_DEL_REPOSITORIO>
cd flota_app
npm install
3. Configuración de Variables de Entorno (.env)
Crea un archivo .env en la raíz del proyecto (flota_app/.env) con las claves públicas de Supabase.

Importante: Estas claves son necesarias para la subida de fotos (Storage).

Ini, TOML
# Archivo: .env
EXPO_PUBLIC_SUPABASE_URL="[https://tu-proyecto.supabase.co](https://tu-proyecto.supabase.co)"
EXPO_PUBLIC_SUPABASE_ANON_KEY="tu-clave-anon-publica"
4. Configuración de la API
La URL del backend se define en config.js. Asegúrate de que apunte a tu servidor de producción o desarrollo según corresponda.

JavaScript
// Archivo: config.js
export const API_BASE_URL = '[https://flota.datix.cl/](https://flota.datix.cl/)'; 
📱 Ejecución en Desarrollo
Para iniciar el servidor de desarrollo (Metro Bundler):

Bash
# Iniciar servidor (limpiando caché para asegurar carga de .env)
npx expo start -c
Android: Escanea el código QR con la app Expo Go.

iOS: Escanea el código QR con la app de Cámara (requiere Expo Go instalado).

🏗 Generación de APK (Android) 
eas login

Link : https://expo.dev/accounts/carlos_alegria/projects/flota_app/builds/bc5e5511-34ca-40d5-80fd-57e688176762