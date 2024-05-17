/** A function that draws a color wheel on a canvas
 * @param {number} outerRadius - The outer radius of the color wheel
 * @param {number} ratio - The ratio of the inner radius to the outer radius
 * @param {number[]} pos - The position of the center of the color wheel
 * @param {number} rotationAngle - The rotation angle of the color wheel
 */


function calculateOuterRadius() {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    return Math.min(screenWidth, screenHeight) * 0.15; // Example calculation: 40% of the smaller screen dimension
}

export const outerRadius = calculateOuterRadius();
export const ratio = 0.7; // Inner radius is 70% of the outer radius


export function drawColorWheel(outerRadius, ratio, pos, rotationAngle) {
    const [centerX, centerY] = pos;

    return {
        obj_type: 'manual',
        startX: centerX,
        startY: centerY,
        drawFunc: function (stimulus, canvas, context) {
            for (let angle = 0; angle < 360; angle += 1) {
                let startAngle = (angle - 2 + rotationAngle) * Math.PI / 180;
                let endAngle = (angle + rotationAngle) * Math.PI / 180;

                context.fillStyle = `hsl(${angle}, 80%, 50%)`;

                context.beginPath();
                context.moveTo(centerX, centerY);
                context.arc(centerX, centerY, outerRadius, startAngle, endAngle);
                context.closePath();
                context.fill();
            }

            let innerRadius = outerRadius * ratio;
            context.globalCompositeOperation = "destination-out";

            context.fillStyle = "rgba(0, 0, 0, 1)";
            context.beginPath();
            context.arc(centerX, centerY, innerRadius, 0, 2 * Math.PI);
            context.closePath();
            context.fill();

            context.globalCompositeOperation = "source-over";
        }
    };
}

export function getRandomRotationAngle() {
    return Math.floor(Math.random() * 360);
}

export function calculateColorFromAngle(angle, rotationAngle) {
    const adjustedAngle = (angle - rotationAngle + 360) % 360;  // Adjust the angle calculation
    return `hsl(${adjustedAngle}, 80%, 50%)`;
}

export function getAngleFromCoordinates(x, y, centerX, centerY) {
    const angle = (Math.atan2(y - centerY, x - centerX) * 180 / Math.PI + 360) % 360;
    return angle;
}

