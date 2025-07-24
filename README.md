# Proyecto de Juegos en Línea

Este es un proyecto de juegos en línea que permite a los usuarios jugar a diferentes juegos con un sistema de apuestas, utilizando tecnologías como **JavaScript**, **CSS**, **HTML**, **Express**, **Node.js**, **MySQL**, y **Docker Compose**. El sistema incluye un juego de **Coinflip**, **Buscaminas**, **Sorteos** y una funcionalidad de **perfil** para registrar usuarios, así como un ranking basado en monedas acumuladas.

## Tecnologías Usadas

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express
- **Base de Datos**: MySQL
- **Contenedor**: Docker y Docker Compose

## Descripción de los Juegos

### 1. Coinflip 

- Los usuarios pueden crear una **sala de Coinflip** donde deben definir la cantidad de **monedas** que van a apostar.
- El juego es un **50/50**, donde dos jugadores se enfrentan.
- Si un jugador gana, obtiene las monedas apostadas por ambos.
- El **dueño de la sala** tiene la opción de eliminarla si lo desea.

### 2. Buscaminas 3x3

- Los usuarios pueden crear una **sala de Buscaminas** con un tablero de 3x3.
- Al crear la sala, pueden elegir entre **1 a 5 minas** en el tablero.
- Los jugadores hacen clic en las casillas para descubrir si hay una mina o no.
- Si el jugador hace clic en una casilla sin mina, gana la cantidad de dinero apostada.
- Si hace click en una mina, pierde la apuesta.

### 3. Sorteos

- Los usuarios pueden **crear un sorteo** con una cantidad de **dinero a donar**.
- Otros usuarios pueden unirse y participar, esperando que se realice el sorteo.

### 4. Perfil de Usuario

- Los usuarios pueden **registrarse** y **loguearse** usando un nombre de usuario y contraseña.
- Toda la información del perfil se guarda en una **base de datos**.
- Además, los usuarios pueden ver su **ranking** basado en las monedas acumuladas en los juegos.

## Instalación y Ejecución

### 1. Clonar el Repositorio


## git clone https://github.com/MatiasMontesinos/SQCoins2

### Con el archivo clonado se puede ejecutar individualmente con node index.js estableciendo tambien los datos para la conexión con la DB

## Se puede también levantar con docker-compose build y luego docker-compose up
