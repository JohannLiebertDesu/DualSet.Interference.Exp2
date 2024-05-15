/** A function that draws a color wheel on a canvas
 * 
 * @author Chenyu Li, ChatGPT
 * 
 * @param radius The radius of the color wheel
 * @param ratio The ratio of the inner radius to the outer radius
 * @param pos The center position of the color wheel
 * @returns A object of color wheel that can be used in jsPsych psychophysics plugin
 */

export const outerRadius = 200; // Adjust the outer radius for a larger wheel
export const ratio = 0.7; // Inner radius is 70% of the outer radius

export function drawColorWheel(outerRadius: number, ratio: number, pos: [number, number]) {
    const [centerX, centerY] = pos;

    return {
        obj_type: 'manual',
        startX: centerX,
        startY: centerY,
        drawFunc: function (stimulus, canvas, context) {
            for (let angle = 0; angle < 360; angle += 1) {
                let startAngle = (angle - 2) * Math.PI / 180;
                let endAngle = angle * Math.PI / 180;

                context.fillStyle = "hsl(" + angle + ", 80%, 50%)";

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
