# Dashboard Financiero - API Documentation

## Descripción
Este módulo proporciona endpoints para obtener datos estadísticos y gráficos del dashboard financiero del condominio.

## Endpoints Disponibles

### 1. Resumen Financiero General
**GET** `/api/finanzas/dashboard/resumen/`

Retorna un resumen general del estado financiero del condominio.

**Respuesta:**
```json
{
  "resumen": {
    "total_expensas": 666,
    "expensas_pagadas": 548,
    "expensas_pendientes": 118,
    "porcentaje_pagado": 82.28,
    "monto_total_recaudado": 163450.50,
    "monto_pendiente": 35120.75,
    "contratos_activos": 18,
    "unidades_ocupadas": 18,
    "unidades_disponibles": 22
  }
}
```

---

### 2. Gráfico de Estado de Expensas
**GET** `/api/finanzas/dashboard/grafico-expensas/`

Proporciona datos para un gráfico de dona/pie mostrando expensas pagadas vs pendientes.

**Tipo de Gráfico:** Donut/Pie Chart

**Respuesta:**
```json
{
  "titulo": "Estado de Expensas",
  "tipo": "donut",
  "labels": ["Pagadas", "Pendientes"],
  "datasets": [
    {
      "label": "Cantidad",
      "data": [548, 118],
      "backgroundColor": ["#10B981", "#EF4444"],
      "borderColor": ["#059669", "#DC2626"]
    }
  ],
  "montos": {
    "pagado": 163450.50,
    "pendiente": 35120.75,
    "total": 198571.25
  },
  "porcentajes": {
    "pagado": 82.28,
    "pendiente": 17.72
  }
}
```

**Uso en Chart.js:**
```javascript
new Chart(ctx, {
  type: 'doughnut',
  data: {
    labels: response.labels,
    datasets: response.datasets
  }
});
```

---

### 3. Gráfico de Ingresos Mensuales
**GET** `/api/finanzas/dashboard/grafico-ingresos/?año=2025`

Muestra los ingresos mensuales (expensas pagadas) del año especificado.

**Parámetros Query:**
- `año` (opcional): Año a consultar. Default: año actual

**Tipo de Gráfico:** Bar Chart / Line Chart

**Respuesta:**
```json
{
  "titulo": "Ingresos Mensuales 2025",
  "tipo": "bar",
  "labels": ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
  "datasets": [
    {
      "label": "Ingresos 2025",
      "data": [5240.50, 6150.75, 5980.25, 6300.00, 6450.80, 6100.50, 6280.75, 6350.20, 6420.90, 6500.00, 6380.50, 6150.30],
      "backgroundColor": "#3B82F6",
      "borderColor": "#2563EB",
      "borderWidth": 1
    }
  ],
  "estadisticas": {
    "total_año": 74304.45,
    "promedio_mensual": 6192.04,
    "mes_mayor_ingreso": "Dic",
    "monto_mayor": 6500.00
  },
  "cantidades_por_mes": [18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18]
}
```

**Uso en Chart.js:**
```javascript
new Chart(ctx, {
  type: 'bar',
  data: {
    labels: response.labels,
    datasets: response.datasets
  },
  options: {
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return 'Bs. ' + value.toFixed(2);
          }
        }
      }
    }
  }
});
```

---

### 4. Gráfico de Ranking de Morosos
**GET** `/api/finanzas/dashboard/grafico-morosos/?limite=10`

Muestra el top de propietarios con más deudas pendientes.

**Parámetros Query:**
- `limite` (opcional): Número de propietarios a mostrar. Default: 10

**Tipo de Gráfico:** Horizontal Bar Chart

**Respuesta:**
```json
{
  "titulo": "Top 10 Propietarios con Deudas Pendientes",
  "tipo": "horizontalBar",
  "labels": ["Juan Pérez", "María González", "Carlos Rodríguez", "Ana Martínez", "Luis López"],
  "datasets": [
    {
      "label": "Monto Pendiente (Bs.)",
      "data": [3245.80, 2890.50, 2650.75, 2340.25, 2150.00],
      "backgroundColor": "#F59E0B",
      "borderColor": "#D97706",
      "borderWidth": 1
    }
  ],
  "detalles": [
    {
      "propietario_id": 3,
      "nombre": "Juan Pérez",
      "unidad": "A-103",
      "monto_pendiente": 3245.80,
      "cantidad_pendiente": 11
    }
  ],
  "estadisticas": {
    "total_morosos": 15,
    "deuda_total": 35120.75,
    "promedio_deuda": 2341.38
  }
}
```

**Uso en Chart.js:**
```javascript
new Chart(ctx, {
  type: 'bar',
  data: {
    labels: response.labels,
    datasets: response.datasets
  },
  options: {
    indexAxis: 'y', // Para barras horizontales
    scales: {
      x: {
        beginAtZero: true
      }
    }
  }
});
```

---

### 5. Gráfico Comparativo Anual (BONUS)
**GET** `/api/finanzas/dashboard/grafico-comparativo/`

Compara los ingresos mensuales de los últimos 4 años.

**Tipo de Gráfico:** Line Chart

**Respuesta:**
```json
{
  "titulo": "Comparación de Ingresos por Año",
  "tipo": "line",
  "labels": ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
  "datasets": [
    {
      "label": "2022",
      "data": [3200.50, 3450.75, 3380.25, 3500.00, ...],
      "borderColor": "#EF4444",
      "backgroundColor": "#EF444433",
      "fill": false,
      "tension": 0.4
    },
    {
      "label": "2023",
      "data": [4240.50, 4550.75, 4480.25, 4600.00, ...],
      "borderColor": "#F59E0B",
      "backgroundColor": "#F59E0B33",
      "fill": false,
      "tension": 0.4
    },
    {
      "label": "2024",
      "data": [5240.50, 5550.75, 5480.25, 5600.00, ...],
      "borderColor": "#10B981",
      "backgroundColor": "#10B98133",
      "fill": false,
      "tension": 0.4
    },
    {
      "label": "2025",
      "data": [5240.50, 6150.75, 5980.25, 6300.00, ...],
      "borderColor": "#3B82F6",
      "backgroundColor": "#3B82F633",
      "fill": false,
      "tension": 0.4
    }
  ]
}
```

---

## Autenticación

Todos los endpoints requieren autenticación mediante token JWT.

**Headers requeridos:**
```
Authorization: Bearer <token>
```

---

## Códigos de Estado HTTP

- `200 OK`: Solicitud exitosa
- `401 Unauthorized`: Token no válido o ausente
- `500 Internal Server Error`: Error en el servidor

---

## Paleta de Colores Utilizada

- **Verde** (#10B981): Valores positivos, pagado, activo
- **Rojo** (#EF4444): Valores negativos, pendiente, deuda
- **Azul** (#3B82F6): Información general, año actual
- **Amarillo** (#F59E0B): Advertencias, morosos, alertas

---

## Ejemplo de Uso Completo (React/JavaScript)

```javascript
import { useState, useEffect } from 'react';
import { Chart } from 'chart.js';

function Dashboard() {
  const [resumen, setResumen] = useState(null);
  const [graficoExpensas, setGraficoExpensas] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      
      // Obtener resumen
      const resumenRes = await fetch('/api/finanzas/dashboard/resumen/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setResumen(await resumenRes.json());
      
      // Obtener gráfico de expensas
      const graficoRes = await fetch('/api/finanzas/dashboard/grafico-expensas/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const graficoData = await graficoRes.json();
      setGraficoExpensas(graficoData);
      
      // Renderizar gráfico
      const ctx = document.getElementById('graficoExpensas');
      new Chart(ctx, {
        type: graficoData.tipo,
        data: {
          labels: graficoData.labels,
          datasets: graficoData.datasets
        }
      });
    };
    
    fetchData();
  }, []);
  
  return (
    <div>
      <h1>Dashboard Financiero</h1>
      <div className="resumen">
        <p>Total Recaudado: Bs. {resumen?.resumen.monto_total_recaudado}</p>
        <p>Pendiente: Bs. {resumen?.resumen.monto_pendiente}</p>
      </div>
      <canvas id="graficoExpensas"></canvas>
    </div>
  );
}
```

---

## Notas Importantes

1. Los montos están en Bolivianos (Bs.)
2. Todos los porcentajes están redondeados a 2 decimales
3. Los colores están en formato hexadecimal compatible con Chart.js
4. La opacidad se indica con sufijo (ej: #3B82F633 = 20% opacity)
5. Los datos se actualizan en tiempo real según la base de datos
