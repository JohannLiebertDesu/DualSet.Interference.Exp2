// External function to filter and map stimuli
export function filterAndMapStimuli(stimuli_array) {
    return stimuli_array
        .map((stim) => {
            if (stim.obj_type === 'line') {
                return {
                    category: 'predefined',
                    obj_type: 'line',
                    x1: stim.x1,
                    y1: stim.y1,
                    x2: stim.x2,
                    y2: stim.y2,
                    line_color: stim.line_color,
                };
            } else if (stim.obj_type === 'circle') {
                return {
                    category: 'predefined',
                    obj_type: stim.obj_type,
                    startX: stim.startX,
                    startY: stim.startY,
                    line_color: stim.line_color, // Optional
                    fill_color: stim.fill_color, // Optional
                    radius: stim.radius,
                };
            }
            return null; // Handle unexpected stimulus types
        })
        .filter((stim) => stim !== null); // Remove null values
}
