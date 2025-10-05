from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
import httpx
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="API Gateway - Sistema de Asistencias",
    version="1.0",
    description="Gateway centralizado para todos los microservicios"
)

# Configurar CORS para permitir peticiones desde el frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# URLs de los microservicios
SERVICES = {
    "alumnos": os.getenv("ALUMNOS_URL", "http://localhost:8001"),
    "docentes": os.getenv("DOCENTES_URL", "http://localhost:8002"),
    "directivos": os.getenv("DIRECTIVOS_URL", "http://localhost:8003"),
    "administrativos": os.getenv("ADMINISTRATIVOS_URL", "http://localhost:8004"),
    "vigilancia": os.getenv("VIGILANCIA_URL", "http://localhost:8005"),
    "reportes": os.getenv("REPORTES_URL", "http://localhost:8006"),
}

@app.get("/")
def read_root():
    return {
        "mensaje": "API Gateway - Sistema de Asistencias",
        "version": "1.0",
        "microservicios": {
            "alumnos": "/api/alumnos",
            "docentes": "/api/docentes",
            "directivos": "/api/directivos",
            "administrativos": "/api/administrativos",
            "vigilancia": "/api/vigilancia",
            "reportes": "/api/reportes"
        },
        "estado": "funcionando"
    }

@app.get("/health")
async def health_check():
    """Verifica el estado de todos los microservicios"""
    health_status = {}
    
    async with httpx.AsyncClient(timeout=5.0) as client:
        for service_name, service_url in SERVICES.items():
            try:
                response = await client.get(service_url)
                health_status[service_name] = {
                    "status": "healthy" if response.status_code == 200 else "unhealthy",
                    "url": service_url
                }
            except Exception as e:
                health_status[service_name] = {
                    "status": "unreachable",
                    "error": str(e)
                }
    
    return health_status

# Proxy para microservicio de alumnos
@app.api_route("/api/alumnos/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def proxy_alumnos(request: Request, path: str):
    return await forward_request(request, "alumnos", path)

# Proxy para microservicio de docentes
@app.api_route("/api/docentes/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def proxy_docentes(request: Request, path: str):
    return await forward_request(request, "docentes", path)

# Proxy para microservicio de directivos
@app.api_route("/api/directivos/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def proxy_directivos(request: Request, path: str):
    return await forward_request(request, "directivos", path)

# Proxy para microservicio de administrativos
@app.api_route("/api/administrativos/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def proxy_administrativos(request: Request, path: str):
    return await forward_request(request, "administrativos", path)

# Proxy para microservicio de vigilancia
@app.api_route("/api/vigilancia/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def proxy_vigilancia(request: Request, path: str):
    return await forward_request(request, "vigilancia", path)

# Proxy para microservicio de reportes
@app.api_route("/api/reportes/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def proxy_reportes(request: Request, path: str):
    return await forward_request(request, "reportes", path)

async def forward_request(request: Request, service: str, path: str):
    """Reenvía la petición al microservicio correspondiente"""
    
    service_url = SERVICES.get(service)
    if not service_url:
        raise HTTPException(status_code=404, detail=f"Servicio {service} no encontrado")
    
    target_url = f"{service_url}/{path}"
    
    # Obtener el cuerpo de la petición si existe
    body = None
    if request.method in ["POST", "PUT"]:
        body = await request.body()
    
    # Realizar la petición al microservicio
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.request(
                method=request.method,
                url=target_url,
                headers=dict(request.headers),
                content=body,
                params=dict(request.query_params)
            )
            
            return response.json()
        
        except httpx.TimeoutException:
            raise HTTPException(status_code=504, detail=f"Timeout al conectar con {service}")
        except httpx.RequestError as e:
            raise HTTPException(status_code=503, detail=f"Error al conectar con {service}: {str(e)}")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)