// Variables globales para la gráfica y datos
let resultChart = null;
let currentChartType = 'bar';
let calculoData = {};

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    inicializarMenu();
    inicializarEventListeners();
    configurarValoresPorDefecto();
});

// Inicializar el menú hamburguesa
function inicializarMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const mainNav = document.getElementById('mainNav');
    const overlay = document.getElementById('overlay');
    
    // Alternar menú hamburguesa
    menuToggle.addEventListener('click', function() {
        mainNav.classList.toggle('active');
        overlay.classList.toggle('active');
        menuToggle.classList.toggle('active');
    });
    
    // Cerrar menú al hacer clic en overlay
    overlay.addEventListener('click', function() {
        mainNav.classList.remove('active');
        overlay.classList.remove('active');
        menuToggle.classList.remove('active');
    });
    
    // Cerrar menú al hacer clic en un enlace (en móviles)
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                mainNav.classList.remove('active');
                overlay.classList.remove('active');
                menuToggle.classList.remove('active');
            }
        });
    });
}

// Inicializar event listeners
function inicializarEventListeners() {
    // Botón calcular
    document.getElementById('btnCalcular').addEventListener('click', calcularArea);
    
    // Botón reiniciar
    document.getElementById('btnReiniciar').addEventListener('click', reiniciar);
    
    // Botones de gráfica
    document.querySelectorAll('.btn-chart').forEach(btn => {
        btn.addEventListener('click', function() {
            cambiarTipoGrafica(this.dataset.type);
        });
    });
    
    // Botón descargar
    document.getElementById('btnDescargar').addEventListener('click', descargarGrafica);
    
    // Botones compartir
    document.querySelectorAll('.btn-share').forEach(btn => {
        if (btn.id !== 'btnCopiar') {
            btn.addEventListener('click', function() {
                compartirResultados(this.dataset.platform);
            });
        }
    });
    
    // Botón copiar
    document.getElementById('btnCopiar').addEventListener('click', copiarEnlace);
}

// Configurar valores por defecto
function configurarValoresPorDefecto() {
    const precipitacionInput = document.getElementById('precipitacion');
    precipitacionInput.placeholder = 'mm/año (Zinacantepec: ~800 mm)';
    
    // Agregar valor por defecto al hacer clic
    precipitacionInput.addEventListener('click', function() {
        if (!this.value) {
            this.value = '800';
        }
    });
}

// Función principal de cálculo
function calcularArea() {
    // Obtener valores del formulario
    const areaCaptacion = parseFloat(document.getElementById('areaCaptacion').value);
    const precipitacion = parseFloat(document.getElementById('precipitacion').value);
    const material = document.getElementById('material').value;
    const consumo = document.getElementById('consumo').value ? parseFloat(document.getElementById('consumo').value) : 0;
    
    // Validaciones
    if (!areaCaptacion || !precipitacion || !material) {
        mostrarMensaje('Por favor, complete todos los campos obligatorios', 'error');
        return false;
    }
    
    if (areaCaptacion <= 0 || precipitacion <= 0) {
        mostrarMensaje('Los valores deben ser mayores a cero', 'error');
        return false;
    }
    
    // Calcular eficiencia según el material
    const eficiencia = parseFloat(material);
    
    // Cálculos
    const aguaCaptableAnual = (areaCaptacion * precipitacion * eficiencia) / 1000;
    const aguaCaptableMensual = aguaCaptableAnual / 12;
    
    // Calcular ahorro (asumiendo $15 por m³ de agua)
    const costoPorMetroCubico = 15;
    const potencialAhorro = aguaCaptableAnual * costoPorMetroCubico;
    
    // Calcular porcentaje de ahorro si se proporcionó consumo
    let porcentajeAhorro = 0;
    if (consumo > 0) {
        const consumoAnual = consumo * 12;
        porcentajeAhorro = (aguaCaptableAnual / consumoAnual) * 100;
    }
    
    // Guardar datos para gráficas y compartir
    calculoData = {
        areaCaptacion: areaCaptacion,
        precipitacion: precipitacion,
        eficiencia: eficiencia * 100,
        aguaCaptableAnual: Math.round(aguaCaptableAnual * 100) / 100,
        aguaCaptableMensual: Math.round(aguaCaptableMensual * 100) / 100,
        potencialAhorro: Math.round(potencialAhorro * 100) / 100,
        porcentajeAhorro: Math.round(porcentajeAhorro * 100) / 100,
        consumo: consumo
    };
    
    // Mostrar resultados
    mostrarResultados();
    
    // Inicializar gráfica
    setTimeout(() => {
        inicializarGrafica();
    }, 300);
    
    return false;
}

// Función para mostrar resultados
function mostrarResultados() {
    const resultadoDiv = document.getElementById('resultado');
    
    let contenidoHTML = `
        <h2 class="result-title">Resultados de Captación</h2>
        <div class="result-grid">
            <div class="result-item">
                <div class="result-label">Agua Captable Anual</div>
                <div class="result-value">${calculoData.aguaCaptableAnual} m³</div>
            </div>
            <div class="result-item">
                <div class="result-label">Agua Captable Mensual</div>
                <div class="result-value">${calculoData.aguaCaptableMensual} m³</div>
            </div>
            <div class="result-item">
                <div class="result-label">Potencial Ahorro Anual</div>
                <div class="result-value">$${calculoData.potencialAhorro}</div>
            </div>
    `;
    
    if (calculoData.consumo > 0) {
        contenidoHTML += `
            <div class="result-item">
                <div class="result-label">Porcentaje de Ahorro</div>
                <div class="result-value">${calculoData.porcentajeAhorro}%</div>
            </div>
        `;
    }
    
    contenidoHTML += `
        </div>
        <div class="tip">
            <h3>💡 Recomendación</h3>
            <p>Con ${calculoData.aguaCaptableAnual} m³ de agua anuales puedes satisfacer necesidades como riego de jardines, limpieza de exteriores y uso en sanitarios. ¡Es un excelente comienzo para tu autonomía hídrica!</p>
        </div>
    `;
    
    resultadoDiv.innerHTML = contenidoHTML;
    resultadoDiv.classList.add('active');
    
    // Mostrar secciones de gráfica y compartir
    document.getElementById('graficaSection').classList.add('active');
    document.getElementById('shareSection').classList.add('active');
}

// Función para inicializar o actualizar la gráfica
function inicializarGrafica() {
    const ctx = document.getElementById('resultChart').getContext('2d');
    
    // Destruir gráfica anterior si existe
    if (resultChart) {
        resultChart.destroy();
    }
    
    const config = {
        type: currentChartType,
        data: obtenerDatosGrafica(),
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        font: {
                            size: 14,
                            family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
                        },
                        color: '#333'
                    }
                },
                title: {
                    display: true,
                    text: 'Resumen de Captación de Agua',
                    font: {
                        size: 16,
                        weight: 'bold',
                        family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
                    },
                    color: '#1a5f7a'
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleFont: {
                        size: 14
                    },
                    bodyFont: {
                        size: 13
                    },
                    padding: 12,
                    cornerRadius: 8,
                    callbacks: {
                        label: function(context) {
                            return `${context.label}: ${context.parsed} m³`;
                        }
                    }
                }
            },
            animation: {
                duration: 1000,
                easing: 'easeOutQuart'
            }
        }
    };
    
    // Configuración específica para gráfica de barras
    if (currentChartType === 'bar') {
        config.options.scales = {
            y: {
                beginAtZero: true,
                ticks: {
                    font: {
                        size: 12
                    },
                    callback: function(value) {
                        return value + ' m³';
                    }
                },
                grid: {
                    color: 'rgba(0, 0, 0, 0.1)'
                }
            },
            x: {
                ticks: {
                    font: {
                        size: 12
                    }
                },
                grid: {
                    display: false
                }
            }
        };
    }
    
    resultChart = new Chart(ctx, config);
}

// Función para obtener datos de la gráfica
function obtenerDatosGrafica() {
    const labels = ['Agua Captable Anual', 'Agua Captable Mensual'];
    const datos = [calculoData.aguaCaptableAnual, calculoData.aguaCaptableMensual];
    const colores = ['rgba(26, 95, 122, 0.8)', 'rgba(21, 152, 149, 0.8)'];
    const bordes = ['rgba(26, 95, 122, 1)', 'rgba(21, 152, 149, 1)'];
    
    // Agregar datos adicionales si están disponibles
    if (calculoData.potencialAhorro > 0) {
        labels.push('Potencial Ahorro ($)');
        datos.push(calculoData.potencialAhorro);
        colores.push('rgba(87, 197, 182, 0.8)');
        bordes.push('rgba(87, 197, 182, 1)');
    }
    
    if (calculoData.porcentajeAhorro > 0) {
        labels.push('Porcentaje Ahorro (%)');
        datos.push(calculoData.porcentajeAhorro);
        colores.push('rgba(44, 62, 80, 0.8)');
        bordes.push('rgba(44, 62, 80, 1)');
    }
    
    return {
        labels: labels,
        datasets: [{
            label: 'Resultados',
            data: datos,
            backgroundColor: colores,
            borderColor: bordes,
            borderWidth: 2,
            borderRadius: currentChartType === 'bar' ? 8 : 0,
            borderSkipped: false,
        }]
    };
}

// Función para cambiar el tipo de gráfica
function cambiarTipoGrafica(tipo) {
    currentChartType = tipo;
    
    // Actualizar estado visual de los botones
    document.querySelectorAll('.btn-chart').forEach(btn => {
        btn.classList.remove('active');
    });
    
    event.target.classList.add('active');
    
    // Recrear la gráfica con el nuevo tipo
    inicializarGrafica();
}

// Función para descargar la gráfica
function descargarGrafica() {
    if (resultChart) {
        const link = document.createElement('a');
        link.download = 'captacion-agua-resultados.png';
        link.href = document.getElementById('resultChart').toDataURL('image/png');
        link.click();
        
        // Mostrar mensaje de confirmación
        mostrarMensaje('¡Gráfica descargada correctamente!', 'success');
    }
}

// Función para compartir resultados
function compartirResultados(plataforma) {
    const texto = `¡Mira mis resultados de captación de agua! 🌧️💧\n\n` +
                 `• Agua captable anual: ${calculoData.aguaCaptableAnual} m³\n` +
                 `• Ahorro potencial: $${calculoData.potencialAhorro}\n` +
                 `• Porcentaje de ahorro: ${calculoData.porcentajeAhorro}%\n\n` +
                 `Calculado con la herramienta de Captación de Agua Zinacantepec`;
    
    let url = '';
    
    switch(plataforma) {
        case 'whatsapp':
            url = `https://wa.me/?text=${encodeURIComponent(texto)}`;
            break;
        case 'facebook':
            url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(texto)}`;
            break;
        case 'twitter':
            url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(texto)}&url=${encodeURIComponent(window.location.href)}`;
            break;
    }
    
    if (url) {
        window.open(url, '_blank', 'width=600,height=400');
    }
}

// Función para copiar enlace
function copiarEnlace() {
    const texto = `Mis resultados de captación de agua:\n\n` +
                 `• Área de captación: ${calculoData.areaCaptacion} m²\n` +
                 `• Precipitación: ${calculoData.precipitacion} mm/año\n` +
                 `• Eficiencia: ${calculoData.eficiencia}%\n` +
                 `• Agua captable anual: ${calculoData.aguaCaptableAnual} m³\n` +
                 `• Ahorro potencial: $${calculoData.potencialAhorro}\n\n` +
                 `Calculado con: ${window.location.href}`;
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(texto).then(() => {
            mostrarMensaje('¡Resultados copiados al portapapeles!', 'success');
        }).catch(() => {
            copiarFallback(texto);
        });
    } else {
        copiarFallback(texto);
    }
}

// Fallback para copiar en navegadores antiguos
function copiarFallback(texto) {
    const textArea = document.createElement('textarea');
    textArea.value = texto;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
        mostrarMensaje('¡Resultados copiados al portapapeles!', 'success');
    } catch (err) {
        mostrarMensaje('Error al copiar al portapapeles', 'error');
    }
    
    document.body.removeChild(textArea);
}

// Función para reiniciar la calculadora
function reiniciar() {
    // Limpiar formulario
    document.getElementById('formAreaCaptacion').reset();
    
    // Ocultar resultados
    document.getElementById('resultado').classList.remove('active');
    document.getElementById('graficaSection').classList.remove('active');
    document.getElementById('shareSection').classList.remove('active');
    
    // Destruir gráfica si existe
    if (resultChart) {
        resultChart.destroy();
        resultChart = null;
    }
    
    // Limpiar datos
    calculoData = {};
    
    mostrarMensaje('Calculadora reiniciada', 'info');
}

// Función para mostrar mensajes temporales
function mostrarMensaje(mensaje, tipo = 'info') {
    // Eliminar mensajes existentes
    document.querySelectorAll('.mensaje-alerta').forEach(msg => msg.remove());
    
    // Crear elemento de mensaje
    const mensajeDiv = document.createElement('div');
    mensajeDiv.className = 'mensaje-alerta';
    
    // Configurar color según el tipo
    let backgroundColor = '#2196F3'; // info - azul
    if (tipo === 'success') backgroundColor = '#4CAF50'; // verde
    if (tipo === 'error') backgroundColor = '#f44336'; // rojo
    
    mensajeDiv.style.backgroundColor = backgroundColor;
    mensajeDiv.innerHTML = `
        <span>${mensaje}</span>
        <button onclick="this.parentElement.remove()">&times;</button>
    `;
    
    document.body.appendChild(mensajeDiv);
    
    // Auto-eliminar después de 5 segundos
    setTimeout(() => {
        if (mensajeDiv.parentElement) {
            mensajeDiv.remove();
        }
    }, 5000);
}
