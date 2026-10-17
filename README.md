# El Relleu i els Rius de Catalunya - Joc Educatiu

Joc interactiu de geografia de Catalunya basat en el mapa físic, els elements del relleu, el litoral i la xarxa hidrogràfica.

## Característiques

- **Mode 1: Tria entre 4 opcions (Quiz)**: Un punt vermell intermitent surt al mapa i has de triar la resposta correcta d'entre 4 opcions.
- **Mode 2: Col·loca al mapa**: Se't demana ubicar un element al mapa i has de fer clic al punt corresponent.
- **Mode 3: Mode Estudi**: Exploració lliure del mapa amb dades didàctiques, alçades, conques i pautes escolars.
- **Comptador en temps real**:
  - Encerts
  - Errors
  - Percentatge de precisió
  - Ràtxa d'encerts consecutius
  - Cronòmetre de temps
- **Avaluació Escolar**:
  - Segell amb la nota final (**AE+**, **AE**, **AN**, **AS**, **NA**) tal com a la fitxa avaluada.
  - Opció de reintentar només les preguntes fallades.
- **Efectes de so sintetitzats**: Àudio amb Web Audio API (sense dependències externes) i botó de silenci.

## Execució amb Docker i Nginx

El projecte inclou la configuració completa de `Dockerfile` i `nginx.conf`.

### 1. Amb Docker Compose (Mètode recomanat)
```bash
docker compose up --build -d
```
L'aplicació estarà disponible a: `http://localhost:8080`

### 2. Amb Docker CLI
```bash
# Construir la imatge
docker build -t relleu-catalunya .

# Executar el contenidor Nginx
docker run -d -p 8080:80 --name catalunya-joc relleu-catalunya
```
Obre `http://localhost:8080` al navegador.

### 3. Desenvolupament Local (Node / Vite)
```bash
npm install
npm run dev
```
Obre `http://localhost:3000`.
