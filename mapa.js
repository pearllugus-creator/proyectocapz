// Inicializar el mapa centrado en Zinacantepec, Estado de México
const map = L.map('mapa-interactivo').setView([19.2842, -99.7339], 12);

// Añadir capa de tiles de OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Definir zonas de cobertura con polígonos
const coverageAreas = [
    {
        coords: [
            [19.32, -99.78],
            [19.32, -99.70],
            [19.27, -99.70],
            [19.27, -99.78]
        ],
        level: "high",
        name: "Zona Norte",
        projects: 15
    },
    {
        coords: [
            [19.30, -99.75],
            [19.30, -99.68],
            [19.25, -99.68],
            [19.25, -99.75]
        ],
        level: "medium",
        name: "Zona Centro",
        projects: 22
    },
    {
        coords: [
            [19.28, -99.73],
            [19.28, -99.65],
            [19.23, -99.65],
            [19.23, -99.73]
        ],
        level: "low",
        name: "Zona Sur",
        projects: 8
    }
];

// Colores para los diferentes niveles de cobertura
const coverageColors = {
    high: 'rgba(46, 204, 113, 0.7)',
    medium: 'rgba(241, 196, 15, 0.7)',
    low: 'rgba(230, 126, 34, 0.7)'
};

// Añadir polígonos de cobertura al mapa
coverageAreas.forEach(area => {
    const polygon = L.polygon(area.coords, {
        color: coverageColors[area.level],
        fillOpacity: 0.6,
        weight: 2
    }).addTo(map);
    
    // Añadir tooltip al polígono
    polygon.bindTooltip(area.name, {
        permanent: false,
        direction: 'center',
        className: 'coverage-tooltip'
    });
    
    // Añadir popup con información detallada
    polygon.bindPopup(`
        <div style="text-align: center;">
            <h3>${area.name}</h3>
            <p><strong>Nivel de cobertura:</strong> ${area.level === 'high' ? 'Alta' : area.level === 'medium' ? 'Media' : 'Baja'}</p>
            <p><strong>Proyectos implementados:</strong> ${area.projects}</p>
            <p>Esta área cuenta con servicio ${area.level === 'high' ? 'completo y prioritario' : area.level === 'medium' ? 'estándar' : 'básico'}.</p>
        </div>
    `);
});

// Añadir marcador para la ubicación central
const centralMarker = L.marker([19.2842, -99.7339]).addTo(map);
centralMarker.bindPopup("<b>Oficina Central</b><br>Punto de servicio principal").openPopup();

// Función para buscar ubicación
document.getElementById('search-btn').addEventListener('click', function() {
    const query = document.getElementById('search-input').value;
    if (query) {
        // En una implementación real, aquí se conectaría con un servicio de geocodificación
        // Por ahora, simulamos una búsqueda centrando el mapa en una ubicación aleatoria cercana
        const lat = 19.2842 + (Math.random() - 0.5) * 0.05;
        const lng = -99.7339 + (Math.random() - 0.5) * 0.05;
        
        map.setView([lat, lng], 14);
        
        // Añadir marcador temporal para la búsqueda
        if (window.searchMarker) {
            map.removeLayer(window.searchMarker);
        }
        
        window.searchMarker = L.marker([lat, lng]).addTo(map);
        window.searchMarker.bindPopup(`<b>Ubicación buscada:</b><br>${query}`).openPopup();
    }
});

// Función para ubicar al usuario
document.getElementById('locate-btn').addEventListener('click', function() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            
            map.setView([lat, lng], 14);
            
            // Añadir marcador para la ubicación del usuario
            if (window.userMarker) {
                map.removeLayer(window.userMarker);
            }
            
            window.userMarker = L.marker([lat, lng]).addTo(map);
            window.userMarker.bindPopup("<b>Tu ubicación actual</b>").openPopup();
            
            // Verificar si está en zona de cobertura
            let inCoverage = false;
            let coverageLevel = "none";
            let coverageName = "";
            
            coverageAreas.forEach(area => {
                // En una implementación real, usaríamos una función para verificar si el punto está dentro del polígono
                // Por simplicidad, simulamos la verificación
                const distance = Math.sqrt(
                    Math.pow(lat - 19.2842, 2) + Math.pow(lng - (-99.7339), 2)
                );
                
                if (distance < 0.05) {
                    inCoverage = true;
                    coverageLevel = area.level;
                    coverageName = area.name;
                }
            });
            
            if (inCoverage) {
                alert(`¡Estás en nuestra zona de cobertura! (${coverageName}) Nivel: ${coverageLevel === 'high' ? 'Alta' : coverageLevel === 'medium' ? 'Media' : 'Baja'}`);
            } else {
                alert("Lo sentimos, actualmente no tenemos cobertura en tu ubicación.");
            }
        }, function() {
            alert("No se pudo obtener tu ubicación. Asegúrate de haber permitido el acceso a la ubicación.");
        });
    } else {
        alert("Tu navegador no soporta geolocalización.");
    }
});

// Permitir búsqueda con Enter
document.getElementById('search-input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        document.getElementById('search-btn').click();
    }
});