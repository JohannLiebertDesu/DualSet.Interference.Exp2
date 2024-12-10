export function createColorWheel(startX, startY, outerRadius, innerRadius, offset) {
    return {
        category: 'customWheel', // Custom category to identify this stimulus
        obj_type: 'manual', // Ensure this matches your registration
        startX: startX,
        startY: startY,
        outerRadius: outerRadius,
        innerRadius: innerRadius,
        show_start_time: 0,
        show_end_time: null, // Show for the duration of the trial
        offset: offset, // Offset in degrees
        drawFunc: function(stimulus, canvas, context) { // (these are not passed by me, but required by the psychophysics plugin)
            const numSegments = 360; // Number of color segments
            const angleStep = (2 * Math.PI) / numSegments;

            for (let i = 0; i < numSegments; i++) {
                const startAngle = i * angleStep;
                const endAngle = startAngle + angleStep;
                const angleDegrees = (i / numSegments) * 360;

                const hue = (angleDegrees + offset) % 360;
                context.beginPath();
                context.arc(startX, startY, outerRadius, startAngle, endAngle, false);
                context.arc(startX, startY, innerRadius, endAngle, startAngle, true);
                context.closePath();
                context.fillStyle = `hsl(${hue}, 80%, 50%)`;
                context.fill();
            }
        }
    };
}

export function createOrientationWheel(startX, startY, outerRadius, innerRadius) {
    return {
        category: 'customWheel', // Custom category to identify this stimulus
        obj_type: 'manual', // Ensure this matches your registration
        startX: startX,
        startY: startY,
        outerRadius: outerRadius,
        innerRadius: innerRadius,
        show_start_time: 0,
        show_end_time: null, // Show for the duration of the trial
        offset: 0, // No offset for orientation wheel
        drawFunc: function(stimulus, canvas, context) { 
            // Step 1: Fill the wheel with black
            context.beginPath();
            context.arc(startX, startY, outerRadius, 0, 2 * Math.PI);
            context.arc(startX, startY, innerRadius, 2 * Math.PI, 0, true);
            context.closePath();
            context.fillStyle = 'black';
            context.fill();

            // Step 2: Draw 16 yellow graduation lines
            const numSegments = 16; // Number of graduation lines
            const angleStep = (2 * Math.PI) / numSegments; // 22.5 degrees in radians

            context.strokeStyle = 'yellow';
            context.lineWidth = 2; // Adjust line width as needed

            for (let i = 0; i < numSegments; i++) {
                const angle = i * angleStep;

                // Calculate start (inner) and end (outer) points of the line
                const xStart = startX + innerRadius * Math.cos(angle);
                const yStart = startY + innerRadius * Math.sin(angle);
                const xEnd = startX + outerRadius * Math.cos(angle);
                const yEnd = startY + outerRadius * Math.sin(angle);

                // Draw the line
                context.beginPath();
                context.moveTo(xStart, yStart);
                context.lineTo(xEnd, yEnd);
                context.stroke();
            }
        }
    };
}
