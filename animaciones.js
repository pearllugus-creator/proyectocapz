// Animaciones al hacer scroll
document.addEventListener('DOMContentLoaded', function() {
    // Animación de scroll para el header
    const header = document.getElementById('mainHeader');
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Animación de elementos al hacer scroll
    const animateOnScroll = function() {
        const elements = document.querySelectorAll('.animate-on-scroll');
        
        elements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const screenPosition = window.innerHeight / 1.3;
            
            if (elementPosition < screenPosition) {
                element.classList.add('animated');
            }
        });
    };

    // Ejecutar al cargar y al hacer scroll
    window.addEventListener('load', animateOnScroll);
    window.addEventListener('scroll', animateOnScroll);

    // Animación para los iconos de beneficios al hacer hover
    const benefitIcons = document.querySelectorAll('.benefit-card i');
    
    benefitIcons.forEach(icon => {
        icon.addEventListener('mouseenter', function() {
            this.style.animation = 'bounce 1s';
        });
        
        icon.addEventListener('animationend', function() {
            this.style.animation = '';
        });
    });

    // Animación para el formulario de contacto
    const formInputs = document.querySelectorAll('.form-group input, .form-group textarea');
    
    formInputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            if (this.value === '') {
                this.parentElement.classList.remove('focused');
            }
        });
    });

    // Efecto de typing en el hero (opcional)
    const heroTitle = document.querySelector('.hero h2');
    const heroText = heroTitle.textContent;
    heroTitle.textContent = '';
    
    let i = 0;
    const typeWriter = function() {
        if (i < heroText.length) {
            heroTitle.textContent += heroText.charAt(i);
            i++;
            setTimeout(typeWriter, 50);
        }
    };
    
    // Iniciar efecto typing después de un breve delay
    setTimeout(typeWriter, 1000);

    // Animación para los números de proyectos (contador)
    const projectNumbers = document.querySelectorAll('.map-info li');
    
    const animateCounter = function(element, finalValue, duration) {
        let start = 0;
        const increment = finalValue / (duration / 16); // 60fps
        const timer = setInterval(function() {
            start += increment;
            if (start >= finalValue) {
                element.textContent = finalValue;
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(start);
            }
        }, 16);
    };

    // Observar cuando la sección del mapa entra en vista
    const mapSection = document.querySelector('.map-section');
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                projectNumbers.forEach(li => {
                    const text = li.textContent;
                    const number = text.match(/\d+/);
                    if (number) {
                        const span = document.createElement('span');
                        li.textContent = text.replace(number, '');
                        li.appendChild(span);
                        animateCounter(span, parseInt(number[0]), 2000);
                    }
                });
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    observer.observe(mapSection);
});