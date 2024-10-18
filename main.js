// Esperar a que el DOM esté cargado
document.addEventListener('DOMContentLoaded', function () {
    // Configuramos el canvas
    const CANVAS = document.getElementById("miCanvas");
    const CTX = CANVAS.getContext("2d");
    CANVAS.width = window.innerWidth;
    CANVAS.height = window.innerHeight;

    // Creamos las variables de Matter.js
    var Engine = Matter.Engine,
        Render = Matter.Render,
        Runner = Matter.Runner,
        Bodies = Matter.Bodies,
        Body = Matter.Body,
        Composite = Matter.Composite;

    // Creamos un engine
    var engine = Engine.create();

    // Creamos un renderer
    var render = Render.create({
        element: document.body,
        engine: engine,
        canvas: CANVAS,
        options: {
            showPerformance: true,
            showDebug: true,
            width: CANVAS.width,
            height: CANVAS.height,
        }
    });

    // Función para generar los vértices de la estrella
    function crearVerticesEstrella(cx, cy, spikes, outerRadius, innerRadius) {
        const vertices = [];
        let rot = (Math.PI / 2) * 3; //Rotación para que la estrella esté recta
        const step = Math.PI / spikes; //Paso entre los picos

        for (let i = 0; i < spikes * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius; // Alternar entre radios
            vertices.push({
                x: cx + Math.cos(rot) * radius,
                y: cy + Math.sin(rot) * radius
            });
            rot += step;
        }
        return vertices;
    }

    // Crear la estrella como un cuerpo físico
    const spikes = 5;
    const outerRadius = 30;
    const innerRadius = 30;
    const vertices = crearVerticesEstrella(0, 0, spikes, outerRadius, innerRadius);
    const starBody = Bodies.fromVertices(CANVAS.width / 2, 20, vertices, {
        render: {
            fillStyle: 'gold',
            lineWidth: 2
        }
    });

    // Agregamos el cuerpo de la estrella al mundo
    Composite.add(engine.world, starBody);

    // Ejecutar el motor de Matter.js
    const runner = Runner.create();
    Runner.run(runner, engine);
    Render.run(render);

    // Variables para el rastro
    let trail = [];
    let maxTrailLength = 100; // Número máximo de puntos en el rastro
    const colors = ['red', 'orange', 'yellow', 'green', 'blue', 'purple'];

    // Función para dibujar el rastro
    function drawTrail() {
        for (let i = 0; i < trail.length - 1; i++) {
            CTX.beginPath();
            CTX.moveTo(trail[i].x, trail[i].y);
            CTX.lineTo(trail[i + 1].x, trail[i + 1].y);
            CTX.strokeStyle = colors[i % colors.length]; // Cambiar color de la línea
            CTX.lineWidth = 2;
            CTX.stroke();
        }
    }

    // Variables para el movimiento
    let direction = 1; // 1 = right, -1 = left
    let forceMagnitude = 0.01; // Magnitud de la fuerza para el movimiento horizontal
    const boundaryLeft = CANVAS.width/2; // Límite izquierdo del movimiento
    const boundaryRight = 800; // Límite derecho del movimiento

    // Función para dibujar la estrella y su rastro
    function renderCanvas() {
        // No limpiar el canvas completamente para mantener el rastro
        // Agregar la posición actual de la estrella al rastro
        trail.push({ x: starBody.position.x, y: starBody.position.y });

        // Limitar la longitud del rastro
        if (trail.length > maxTrailLength) {
            trail.shift(); // Eliminar el punto más antiguo
        }

        // Dibujar el rastro
        drawTrail();

        // Dibujar la estrella usando su imagen
        let starImage = new Image();
        starImage.src = "https://png.pngtree.com/png-vector/20230222/ourmid/pngtree-shiny-yellow-star-icon-clipart-png-image_6613580.png";
        CTX.drawImage(starImage, starBody.position.x - 65, starBody.position.y - 65, 130, 130); // Ajustar la posición para centrar la imagen

        requestAnimationFrame(renderCanvas); // Llamar a la siguiente actualización
    }

    // Función para mover la estrella
    function moveStar() {
        // Aplicar fuerza horizontal para que la estrella se mueva de lado a lado
        Body.applyForce(starBody,
            { x: starBody.position.x, y: starBody.position.y },
            { x: forceMagnitude * direction, y: 0.002 }); // Fuerza horizontal y pequeña fuerza hacia abajo (caída)

        // Invertir dirección si alcanza los límites
        if (starBody.position.x >= boundaryRight) {
            direction = -1; // Cambiar a izquierda
        } else if (starBody.position.x <= boundaryLeft) {
            direction = 1; // Cambiar a derecha
        }

        requestAnimationFrame(moveStar); // Continuar el movimiento
    }

    // Iniciar el renderizado y movimiento
    renderCanvas();
    moveStar();
});
