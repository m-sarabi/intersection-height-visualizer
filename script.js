const center = {x: 100, y: 300};

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 600;
    const offset = {x: 200, y: 0};
    let isAnimated = true;

    const polygonPoints = [
        {x: 50, y: 200},
        {x: 100, y: 290},
        {x: 150, y: 200},
        {x: 200, y: 250},
        {x: 110, y: 300},
        {x: 200, y: 350},
        {x: 150, y: 400},
        {x: 100, y: 310},
        {x: 50, y: 400},
        {x: 0, y: 350},
        {x: 90, y: 300},
        {x: 0, y: 250},
    ];

    // draw a circle on cx, cy
    ctx.beginPath();
    ctx.arc(center.x, center.y, 2, 0, 2 * Math.PI);
    ctx.fillStyle = 'black';
    ctx.fill();

    drawPolygon(ctx, polygonPoints, 'black', 'white');

    let degree = 26;

    const heights = [];

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // draw the rectangle
        ctx.beginPath();
        ctx.strokeStyle = '#ccc';
        ctx.rect(0, 200, 200, 200);
        ctx.stroke();
        ctx.closePath();
        ctx.strokeStyle = 'black';
        drawCircle(ctx, center.x, center.y, 2, 'black');
        if (!isAnimated) {
            return;
        }
        drawPolygon(ctx, polygonPoints, 'black', 'white');
        const intersection = drawLine(ctx, center.x, center.y, degree, polygonPoints);
        degree += 1;
        requestAnimationFrame(animate);

        if (intersection) {
            heights.unshift(intersection.y);
        }
        if (heights.length > 600) {
            heights.pop();
        }

        drawChart(ctx, heights, offset);
    }

    animate();

    const clearButton = document.getElementById('clear');
    clearButton.addEventListener('click', () => {
        isAnimated = false;
        heights.length = 0;
        polygonPoints.length = 0;
    });

    canvas.addEventListener('click', (event) => {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        if (x < 0 || x > 200 || y < 200 || y > 400) {
            return;
        }
        polygonPoints.push({x, y});
        drawPolygon(ctx, polygonPoints, 'black', 'white');
        if (polygonPoints.length >= 3 && !isAnimated) {
            isAnimated = true;
            animate();
        }
    });

});

function drawPolygon(ctx, points, color, bg) {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.fillStyle = bg;
    ctx.moveTo(points[0].x, points[0].y);
    points.forEach(point => {
        ctx.lineTo(point.x, point.y);
    });
    ctx.closePath();
    ctx.stroke();
    points.forEach(point => {
        drawCircle(ctx, point.x, point.y, 2, 'black');
    });
}

function toRadians(angle) {
    return angle * (Math.PI / 180);
}

function getIntersection(cx, cy, angle, x1, y1, x2, y2) {
    const theta = toRadians(angle);

    const cx2 = cx + Math.cos(theta);
    const cy2 = cy + Math.sin(theta);

    const dx = x2 - x1;
    const dy = y2 - y1;
    const dcx = cx2 - cx;
    const dcy = cy2 - cy;

    const det = (dy * dcx) - (dx * dcy);
    const dc = (y1 * x2) - (x1 * y2);
    const dcc = (cy * cx2) - (cx * cy2);

    // see if lines are parallel
    if (det === 0) {
        return null;
    }

    // get the intersection point
    const x = (dcc * dx - dc * dcx) / det;
    const y = (dcc * dy - dc * dcy) / det;

    // check if the intersection point is on the segments
    if (Math.min(x1, x2) > x * 1.001 || x * 0.999 > Math.max(x1, x2) || Math.min(y1, y2) > y * 1.001 || y * 0.999 > Math.max(y1, y2)) {
        return null;
    }

    // check if the intersection point is in the direction of the line
    if (dcx * (x - cx) >= 0 && dcy * (y - cy) >= 0) {
        return {x, y};
    }

    return null;
}

function drawLine(ctx, x1, y1, angle, points) {
    const intersections = [];
    for (let i = 0; i < points.length; i++) {
        const next = (i + 1) % points.length;
        const intersection = getIntersection(x1, y1, angle, points[i].x, points[i].y, points[next].x, points[next].y);
        if (intersection) {
            intersections.push(intersection);
        }
    }

    if (intersections.length === 0) {
        console.log(angle);
        return null;
    }
    intersections.sort((a, b) => Math.hypot(a.x - x1, a.y - y1) - Math.hypot(b.x - x1, b.y - y1));
    const closest = intersections[0];
    drawCircle(ctx, closest.x, closest.y, 4, 'red');
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(closest.x, closest.y);
    ctx.stroke();
    return intersections[0];
}

function drawChart(ctx, heights, offset) {

    drawCircle(ctx, offset.x, heights[0], 4, 'red');
    ctx.beginPath();

    ctx.moveTo(offset.x, heights[0] + offset.y);
    for (let i = 1; i < heights.length; i++) {
        ctx.lineTo(i + offset.x, heights[i - 1] + offset.y);
    }
    ctx.stroke();

    ctx.closePath();
}

function drawCircle(ctx, x, y, radius, color) {
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.closePath();
}