function calculateScaleFactor(vector) {
    const maxComponent = Math.max(Math.abs(vector.x), Math.abs(vector.y));
    const canvasSize = Math.min(document.getElementById('vector-canvas').width, 
                                document.getElementById('vector-canvas').height) / 2;
    // Ensure the scale factor is large enough to display the vector within the canvas
    return maxComponent > 0 ? canvasSize / (2*maxComponent) : 10; // '10' as a default scale factor
}

function drawAxes(ctx, scaleFactor) {
    const canvasWidth = ctx.canvas.width;
    const canvasHeight = ctx.canvas.height;
    const center_x = canvasWidth / 2;
    const center_y = canvasHeight / 2;

    // Draw X and Y axes
    ctx.beginPath();
    ctx.moveTo(0, center_y);
    ctx.lineTo(canvasWidth, center_y);
    ctx.moveTo(center_x, 0);
    ctx.lineTo(center_x, canvasHeight);
    ctx.strokeStyle = 'black';
    ctx.stroke();

    // Draw scale marks for X axis
    for (let x = center_x; x < canvasWidth; x += scaleFactor) {
        ctx.moveTo(x, center_y - 5);
        ctx.lineTo(x, center_y + 5);
    }
    for (let x = center_x; x > 0; x -= scaleFactor) {
        ctx.moveTo(x, center_y - 5);
        ctx.lineTo(x, center_y + 5);
    }

    // Draw scale marks for Y axis
    for (let y = center_y; y < canvasHeight; y += scaleFactor) {
        ctx.moveTo(center_x - 5, y);
        ctx.lineTo(center_x + 5, y);
    }
    for (let y = center_y; y > 0; y -= scaleFactor) {
        ctx.moveTo(center_x - 5, y);
        ctx.lineTo(center_x + 5, y);
    }

    ctx.strokeStyle = 'black';
    ctx.stroke();
}

function drawVector(vector) {
    const canvas = document.getElementById('vector-canvas');
    const ctx = canvas.getContext('2d');
    const scaleFactor = calculateScaleFactor(vector);

    // Clear canvas and redraw axes
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawAxes(ctx, scaleFactor);

    // Draw vector
    let endX = canvas.width / 2 + vector.x * scaleFactor;
    let endY = canvas.height / 2 - vector.y * scaleFactor;

    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, canvas.height / 2);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = 'red';
    ctx.stroke();

    // Draw end point
    ctx.beginPath();
    ctx.arc(endX, endY, 3, 0, 2 * Math.PI); // Small circle for the end point
    ctx.fillStyle = 'blue';
    ctx.fill();

    // Label the point
    ctx.font = "12px Arial";
    ctx.fillText(`(${vector.x}, ${vector.y})`, endX + 5, endY - 5); // Adjust label position as needed
}

function addVectors() {
    let v1x = parseFloat(document.getElementById('vector1-x').value) || 0;
    let v1y = parseFloat(document.getElementById('vector1-y').value) || 0;
    let v2x = parseFloat(document.getElementById('vector2-x').value) || 0;
    let v2y = parseFloat(document.getElementById('vector2-y').value) || 0;
    
    let resultVector = { x: v1x + v2x, y: v1y + v2y };
    drawVector(resultVector);
}

function subtractVectors() {
    let v1x = parseFloat(document.getElementById('vector1-x').value) || 0;
    let v1y = parseFloat(document.getElementById('vector1-y').value) || 0;
    let v2x = parseFloat(document.getElementById('vector2-x').value) || 0;
    let v2y = parseFloat(document.getElementById('vector2-y').value) || 0;
    
    let resultVector = { x: v1x - v2x, y: v1y - v2y };
    drawVector(resultVector);
}

function scalarMultiply(vectorId) {
    let scalar = parseFloat(document.getElementById('scalar-value').value) || 0;
    let vx = parseFloat(document.getElementById(vectorId + '-x').value) || 0;
    let vy = parseFloat(document.getElementById(vectorId + '-y').value) || 0;
    
    let resultVector = { x: vx * scalar, y: vy * scalar };
    drawVector(resultVector);
}

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('vector-canvas');
    const ctx = canvas.getContext('2d');
    drawAxes(ctx);
});
