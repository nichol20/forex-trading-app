import React, { useRef, useEffect, useState, useCallback } from 'react';

interface Props {
    data: number[];
    labels: string[]; // same length as data, e.g. ['31 Mar', '10 Apr', …]
    width?: number;
    height?: number;
}

interface Tooltip {
    x: number;
    y: number;
    value: number;
    label: string;
}

export const TimeSeriesChart = ({
    data,
    labels,
    width = 600,
    height = 300,
}: Props) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [tooltip, setTooltip] = useState<Tooltip | null>(null);

    const pad = 22; // padding around the chart area
    const pointRadius = 4; // point size
    const hoverRadius = 6; // maximum radius the mouse needs to be around the point to show the tooltip

    // map data domain → canvas coords
    const max = Math.max(...data);
    const min = Math.min(...data);
    const yRange = max - min;
    const getX = useCallback(
        (i: number) => pad + (i / (data.length - 1)) * (width - 40 * 2), 
        [data, width]
    );
    const getY = useCallback(
        (v: number) => pad + ((max - v) / yRange) * (height - pad * 2), 
        [height, max, yRange]
    );

    // draw whenever data changes
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d')!;
        ctx.clearRect(0, 0, width, height);

        // background
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, width, height);
        
        // draw max and min
        ctx.fillStyle = '#707070';
        ctx.fillText(String(max.toFixed(2)), 0, pad);
        ctx.fillText(String(min.toFixed(2)), 0, height - pad);

        // gridlines
        ctx.strokeStyle = '#919a964c';
        ctx.lineWidth = 1;
        const nGrid = 4;
        for (let i = 0; i <= nGrid; i++) {
            const y = pad + (i / nGrid) * (height - pad * 2);
            ctx.beginPath();
            ctx.moveTo(pad, y);
            ctx.lineTo(width - pad, y);
            ctx.stroke();
        }

        // gradient fill under line
        const grad = ctx.createLinearGradient(0, pad, 0, height - pad);
        grad.addColorStop(0, 'rgba(0,255,0,0.3)');
        grad.addColorStop(1, 'rgba(0,255,0,0)');
        ctx.beginPath();
        data.forEach((v, i) => {
            const x = getX(i), y = getY(v);
            ctx.lineTo(x, y);
            if (i === 0) ctx.moveTo(x, y);
        });

        // draw lines between points
        ctx.strokeStyle = 'lime';
        ctx.lineWidth = 2;
        ctx.stroke();

        // close down to bottom
        ctx.lineTo(getX(data.length - 1), height - pad);
        ctx.lineTo(getX(0), height - pad);
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();

        // draw points
        data.forEach((v, i) => {
            const x = getX(i), y = getY(v);
            ctx.beginPath();
            ctx.arc(x, y, pointRadius, 0, Math.PI * 2);
            ctx.fillStyle = 'lime';
            ctx.fill();
            ctx.strokeStyle = 'lime';
            ctx.lineWidth = 2;
            ctx.stroke();

            if(width > 350 || i === 0 || i === data.length - 1) {
                ctx.fillStyle = "#707070"
                ctx.fillText(`${data.length - i}d`, x, height - 10)
            }
        });
    }, [data, height, width, getX, getY, max, min]);

    // mouse move → show/hide tooltip
    const handleMouseMove = (e: React.MouseEvent) => {
        const rect = canvasRef.current!.getBoundingClientRect();
        // get mouse position inside canvas
        const mx = e.clientX - rect.left; 
        const my = e.clientY - rect.top;
        let found: Tooltip | null = null;
        data.forEach((v, i) => {
            const x = getX(i), y = getY(v);
            // check if mouse is in radius
            const dx = mx - x, dy = my - y;
            if (Math.abs(dx) + Math.abs(dy) < hoverRadius) {
                found = { x, y, value: v, label: labels[i] };
            }
        });
        setTooltip(found);
    };

    const handleMouseLeave = () => {
        setTooltip(null);
    };

    return (
        <div style={{ position: 'relative', width, height }}>
            <canvas
                ref={canvasRef}
                width={width}
                height={height}
                style={{ display: 'block', cursor: 'crosshair' }}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
            />
            {tooltip && (
                <div
                    style={{
                        position: 'absolute',
                        top: tooltip.y - 40,
                        left: tooltip.x,
                        transform: 'translateX(-50%)',
                        padding: '4px 8px',
                        backgroundColor: '#333',
                        color: '#fff',
                        fontSize: 12,
                        borderRadius: 4,
                        pointerEvents: 'none',
                        whiteSpace: 'nowrap',
                    }}
                >
                    {tooltip.label}: {tooltip.value}
                </div>
            )}
        </div>
    );
};
