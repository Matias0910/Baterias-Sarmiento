from fastapi import FastAPI
from pydantic import BaseModel
from typing import List

app = FastAPI()

# Esto es una base de datos temporal en memoria
base_de_datos_temporal = []

class Vaso(BaseModel):
    id: int
    voltaje: float

class ReporteBateria(BaseModel):
    equipo_id: int
    punta: str
    num_vasos: int
    lecturas: List[Vaso]

@app.post("/guardar-lectura")
async def guardar_lectura(reporte: ReporteBateria):
    # Guardamos el reporte en nuestra lista
    base_de_datos_temporal.append(reporte.dict())
    print(f"¡Guardado! Total de reportes en memoria: {len(base_de_datos_temporal)}")
    return {"status": "success", "total_guardados": len(base_de_datos_temporal)}

@app.get("/historial")
async def obtener_historial():
    return base_de_datos_temporal