import React, { useRef, useEffect, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { motion } from 'framer-motion';
import { Box } from './SnowBox';
import { Orientation, ViewMode, PointProps } from '../types';
import { Cloud, Sun, Trees, Waves, Snowflake, Thermometer as ThermometerIcon } from 'lucide-react';

// --- Assets & Illustrations ---

// 1. Ocean Background Assets
const SeaWeed = ({ x, height, delay }: { x: number, height: number, delay: number }) => (
  <motion.path
    d={`M${x},400 Q${x + 10},${400 - height / 2} ${x},${400 - height} Q${x - 10},${400 - height / 2} ${x},400`}
    fill="#047857"
    opacity={0.6}
    animate={{ d: [
       `M${x},400 Q${x + 15},${400 - height / 2} ${x + 5},${400 - height} Q${x - 5},${400 - height / 2} ${x},400`,
       `M${x},400 Q${x - 5},${400 - height / 2} ${x - 15},${400 - height} Q${x + 5},${400 - height / 2} ${x},400`,
       `M${x},400 Q${x + 15},${400 - height / 2} ${x + 5},${400 - height} Q${x - 5},${400 - height / 2} ${x},400`
    ] }}
    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay }}
  />
);

const Bubble = ({ x, delay }: { x: number, delay: number }) => (
  <motion.circle
    cx={x}
    cy={400}
    r={4}
    fill="white"
    opacity={0.4}
    animate={{ cy: 200, opacity: 0 }}
    transition={{ duration: 3, repeat: Infinity, ease: "easeOut", delay }}
  />
);

// 2. House Background Assets
const Tree = ({ x, y }: { x: number, y: number }) => (
  <g transform={`translate(${x}, ${y})`}>
    <rect x={-5} y={0} width={10} height={30} fill="#854d0e" />
    <circle cx={0} cy={-10} r={20} fill="#22c55e" />
    <circle cx={-10} cy={-5} r={15} fill="#16a34a" />
    <circle cx={10} cy={-5} r={15} fill="#16a34a" />
  </g>
);

const CloudShape = ({ x, y, scale = 1, delay = 0 }: { x: number, y: number, scale?: number, delay?: number }) => (
  <motion.g 
    transform={`translate(${x}, ${y}) scale(${scale})`}
    animate={{ x: [x, x + 20, x] }}
    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay }}
  >
    <path d="M25,60.2c-0.6,0-1.1,0-1.7,0.1c-2-8.3-9.5-14.5-18.4-14.5c-6.8,0-12.8,3.6-16.1,9c-1-0.2-2.1-0.4-3.2-0.4C-25.2,54.4-33.1,62.3-33.1,72s7.9,17.6,17.6,17.6c1.3,0,2.6-0.2,3.8-0.5c2.7,4.7,7.8,7.9,13.6,7.9c4.2,0,8-1.7,10.7-4.5c2.1,1.8,4.9,2.9,7.9,2.9c6.9,0,12.5-5.6,12.5-12.5C33,76.5,29.6,71.5,25,60.2z" fill="#FFF" opacity={0.8} />
  </motion.g>
);


// --- Draggable Point Component ---
const DraggablePoint: React.FC<PointProps> = ({
  id,
  value,
  orientation,
  scale,
}) => {
  return null; // Placeholder as implementation is inline for better D3 interop in this specific refactor
};


interface NumberLineProps {
  mode: ViewMode;
  orientation: Orientation;
  pointA: number;
  pointB: number;
  setPointA: (v: number) => void;
  setPointB: (v: number) => void;
  showValues: boolean;
  showDistance: boolean;
}

export const NumberLine: React.FC<NumberLineProps> = ({
  mode,
  orientation,
  pointA,
  pointB,
  setPointA,
  setPointB,
  showValues,
  showDistance
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 });

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };
    window.addEventListener('resize', updateSize);
    updateSize(); // Initial call
    
    // Safety check: if dimensions are 0 (hidden), try again shortly (e.g. after layout stabilization)
    const timer = setTimeout(updateSize, 100);
    
    return () => {
        window.removeEventListener('resize', updateSize);
        clearTimeout(timer);
    }
  }, []);

  const isHorizontal = orientation === Orientation.Horizontal;
  const padding = 80; // Increased padding for icons

  const scale = useMemo(() => {
    // Ensure dimensions are valid to prevent NaNs in scale range
    const w = dimensions.width || 800;
    const h = dimensions.height || 400;

    if (isHorizontal) {
      return d3.scaleLinear()
        .domain([-10, 10])
        .range([padding, w - padding]);
    } else {
      return d3.scaleLinear()
        .domain([10, -10]) 
        .range([padding, h - padding]);
    }
  }, [dimensions, isHorizontal]);

  const ticks = scale.ticks(20);

  // Drag Interaction
  const handlePointerDown = (e: React.PointerEvent, setPoint: (v: number) => void) => {
    // Removed setPointerCapture to allow robust global drag tracking via document events
    // e.currentTarget.setPointerCapture(e.pointerId); 
    e.stopPropagation(); // Stop scrolling/propagation
    e.preventDefault(); // Prevent text selection etc
    
    const svg = svgRef.current;
    if (!svg) return;

    const onPointerMove = (moveEvent: PointerEvent) => {
      const rect = svg.getBoundingClientRect();
      let pos;
      
      if (isHorizontal) {
        pos = moveEvent.clientX - rect.left;
      } else {
        pos = moveEvent.clientY - rect.top;
      }
      
      const range = scale.range();
      // Clamp position to scale range
      pos = Math.max(range[0], Math.min(range[1], pos));
      
      const domainVal = scale.invert(pos);
      setPoint(Math.round(domainVal));
    };

    const onPointerUp = (upEvent: PointerEvent) => {
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerup', onPointerUp);
    };

    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);
  };

  // --- Background Renders ---

  const renderOceanBackground = () => {
    const y0 = scale(0);
    return (
      <g>
        {/* Sky Gradient */}
        <defs>
          <linearGradient id="skyGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#BAE6FD" />
            <stop offset="100%" stopColor="#E0F2FE" />
          </linearGradient>
          <linearGradient id="waterGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#0369A1" />
          </linearGradient>
        </defs>
        
        {/* Sky Area */}
        <rect x={0} y={0} width={dimensions.width} height={y0} fill="url(#skyGradient)" />
        <CloudShape x={100} y={50} scale={0.8} />
        <CloudShape x={dimensions.width - 150} y={80} scale={1.2} delay={2} />
        
        {/* Sun */}
        <motion.g 
          initial={{ rotate: 0 }} 
          animate={{ rotate: 360 }} 
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          style={{ originX: "40px", originY: "40px" }}
        >
             <Sun x={20} y={20} size={60} color="#FDB813" fill="#FDB813" opacity={0.8} />
        </motion.g>

        {/* Water Area */}
        <rect x={0} y={y0} width={dimensions.width} height={dimensions.height - y0} fill="url(#waterGradient)" />
        
        {/* Animated Seaweed */}
        <g transform={`translate(0, ${dimensions.height - 400})`}>
             <SeaWeed x={50} height={80} delay={0} />
             <SeaWeed x={dimensions.width - 60} height={100} delay={1} />
             <SeaWeed x={dimensions.width / 4} height={60} delay={2} />
        </g>

        {/* Bubbles */}
        <g>
           <Bubble x={dimensions.width * 0.3} delay={0} />
           <Bubble x={dimensions.width * 0.7} delay={1.5} />
           <Bubble x={dimensions.width * 0.5} delay={3} />
        </g>

        {/* Water Line */}
        <line x1={0} x2={dimensions.width} y1={y0} y2={y0} stroke="#FFF" strokeWidth={3} strokeOpacity={0.5} />
        <text x={dimensions.width - 70} y={y0 - 10} fill="#0369A1" fontSize={14} fontWeight="bold" fontFamily="sans-serif">海平面 0m</text>
      </g>
    );
  };

  const renderHouseBackground = () => {
    const horizonY = dimensions.height * 0.65;
    return (
      <g>
         {/* Sky */}
         <rect x={0} y={0} width={dimensions.width} height={horizonY} fill="#BFDBFE" />
         <CloudShape x={50} y={40} />
         <CloudShape x={300} y={20} scale={0.7} delay={2} />
         <CloudShape x={600} y={50} scale={1.1} delay={1} />

         {/* Ground (Grass) */}
         <rect x={0} y={horizonY} width={dimensions.width} height={dimensions.height - horizonY} fill="#86EFAC" />
         
         {/* Trees in Background */}
         <Tree x={scale(-8)} y={horizonY - 20} />
         <Tree x={scale(-4)} y={horizonY - 25} />
         <Tree x={scale(6)} y={horizonY - 20} />
         
         {/* Road/Sidewalk (The Axis) */}
         <rect x={0} y={dimensions.height/2 - 20} width={dimensions.width} height={40} fill="#F3F4F6" stroke="#E5E7EB" />
      </g>
    );
  };

  const renderThermometerBackground = () => {
     return (
        <g>
             {/* Simple lab background pattern */}
             <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#E5E7EB" strokeWidth="1"/>
                </pattern>
             </defs>
             <rect width="100%" height="100%" fill="url(#grid)" />
             
             {/* The Thermometer Tube */}
             <rect 
                x={dimensions.width/2 - 30} 
                y={padding - 20} 
                width={60} 
                height={dimensions.height - padding*2 + 40} 
                rx={30} 
                fill="white" 
                stroke="#D1D5DB" 
                strokeWidth={4} 
                className="shadow-lg"
            />
            
            {/* Liquid (Visual only, static gradient for bg) */}
            <defs>
                 <linearGradient id="mercury" x1="0" x2="0" y1="1" y2="0">
                    <stop offset="0%" stopColor="#EF4444" />
                    <stop offset="100%" stopColor="#FCA5A5" />
                 </linearGradient>
            </defs>
            <rect 
                x={dimensions.width/2 - 10} 
                y={padding} 
                width={20} 
                height={dimensions.height - padding * 2} 
                fill="#F3F4F6" 
                rx={10} 
            />
            
            {/* Icons */}
            <Sun x={dimensions.width/2 + 40} y={padding} color="#EF4444" />
            <Snowflake x={dimensions.width/2 + 40} y={dimensions.height - padding - 20} color="#3B82F6" />
        </g>
     )
  }

  // --- Foreground Assets (The Points) ---

  const getPointVisual = (id: 'A' | 'B', val: number) => {
    // 1. General Mode
    if (mode === ViewMode.General) {
      return (
        <g>
           <circle r={16} fill={id === 'A' ? "#EF4444" : "#3B82F6"} stroke="white" strokeWidth={3} className="shadow-md" />
           <text y={5} textAnchor="middle" fill="white" fontSize={12} fontWeight="bold">{id}</text>
        </g>
      );
    }

    // 2. House Mode
    if (mode === ViewMode.House) {
       // A is person, B is House
       if (id === 'A') {
           return (
               <g>
                   {/* Tooltip bubble */}
                   <path d="M-20,-35 H20 A5,5 0 0 1 25,-30 V-10 A5,5 0 0 1 20,-5 H5 L0,5 L-5,-5 H-20 A5,5 0 0 1 -25,-10 V-30 A5,5 0 0 1 -20,-35 Z" fill="white" stroke="#374151" strokeWidth={2} />
                   <text y={-16} textAnchor="middle" fontSize={16}>🏃</text>
                   {/* Marker dot */}
                   <circle r={6} fill="#EF4444" stroke="white" strokeWidth={2} />
               </g>
           )
       } else {
           return (
                <g>
                   <path d="M-20,-35 H20 A5,5 0 0 1 25,-30 V-10 A5,5 0 0 1 20,-5 H5 L0,5 L-5,-5 H-20 A5,5 0 0 1 -25,-10 V-30 A5,5 0 0 1 -20,-35 Z" fill="white" stroke="#374151" strokeWidth={2} />
                   <text y={-16} textAnchor="middle" fontSize={16}>🏠</text>
                   <circle r={6} fill="#3B82F6" stroke="white" strokeWidth={2} />
               </g>
           )
       }
    }

    // 3. Ocean Mode
    if (mode === ViewMode.Ocean) {
        if (id === 'A') { // Bird or Boat (Above water usually)
            // If user drags below water, maybe change icon? No, keep it consistent.
            return (
               <g>
                    <motion.g animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                         <text x={-15} y={-10} fontSize={32}>🕊️</text>
                    </motion.g>
                    <circle r={4} fill="#EF4444" stroke="white" strokeWidth={2} />
               </g>
            )
        } else { // Fish
            return (
                <g>
                    <motion.g animate={{ x: [0, 3, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                        <text x={-15} y={10} fontSize={32}>🐠</text>
                    </motion.g>
                    <circle r={4} fill="#3B82F6" stroke="white" strokeWidth={2} />
               </g>
            )
        }
    }

    // 4. Thermometer Mode
    if (mode === ViewMode.Thermometer) {
        const color = id === 'A' ? "#EF4444" : "#3B82F6";
        return (
            <g>
                 <path d="M0,0 L10,-10 H40 V10 H10 Z" fill={color} stroke="white" strokeWidth={2} />
                 <text x={25} y={4} textAnchor="middle" fill="white" fontSize={10} fontWeight="bold">{id}</text>
            </g>
        )
    }

    return null;
  };

  const renderDistance = () => {
    if (!showDistance) return null;
    const posA = scale(pointA);
    const posB = scale(pointB);
    const minPos = Math.min(posA, posB);
    const maxPos = Math.max(posA, posB);
    const mid = (posA + posB) / 2;
    const distance = Math.abs(pointA - pointB);
    if (Math.abs(posA - posB) < 15) return null;

    const lineColor = mode === ViewMode.General ? "#6B7280" : "#1F2937";
    const boxBg = "rgba(255, 255, 255, 0.9)";

    if (isHorizontal) {
        // Draw distinct brackets
        const yOffset = dimensions.height/2 + 50; 
      return (
        <g>
          <path 
            d={`M ${minPos} ${yOffset - 10} V ${yOffset} H ${maxPos} V ${yOffset - 10}`}
            fill="none"
            stroke={lineColor}
            strokeWidth={2}
          />
          <rect x={mid - 25} y={yOffset - 12} width={50} height={24} rx={12} fill={boxBg} stroke={lineColor} />
          <text x={mid} y={yOffset + 5} textAnchor="middle" fill="#1F2937" fontSize={14} fontWeight="bold">
            {distance} {mode === ViewMode.House ? 'm' : ''}
          </text>
        </g>
      );
    } else {
       const xOffset = dimensions.width/2 - 60;
       return (
        <g>
           <path 
            d={`M ${xOffset + 10} ${minPos} H ${xOffset} V ${maxPos} H ${xOffset + 10}`}
            fill="none"
            stroke={lineColor}
            strokeWidth={2}
          />
          <rect x={xOffset - 15} y={(minPos + maxPos)/2 - 12} width={30} height={24} rx={12} fill={boxBg} stroke={lineColor} />
          <text x={xOffset} y={(minPos + maxPos)/2 + 5} textAnchor="middle" fill="#1F2937" fontSize={14} fontWeight="bold">
            {distance}
          </text>
        </g>
      ); 
    }
  };

  return (
    <Box w="100%" h="100%" relative className="overflow-hidden bg-white" ref={containerRef}>
      <svg 
        ref={svgRef}
        width="100%" 
        height="100%" 
        style={{ touchAction: 'none', userSelect: 'none' }}
      >
        {mode === ViewMode.Ocean && renderOceanBackground()}
        {mode === ViewMode.House && renderHouseBackground()}
        {mode === ViewMode.Thermometer && renderThermometerBackground()}
        {/* General mode default grid maybe? */}
        {mode === ViewMode.General && (
             <pattern id="smallGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1" fill="#E5E7EB" />
             </pattern>
        )}
        {mode === ViewMode.General && <rect width="100%" height="100%" fill="url(#smallGrid)" />}

        {/* Axis Lines & Ticks */}
        {ticks.map(tickVal => {
          const pos = scale(tickVal);
          const isZero = tickVal === 0;
          let tickColor = "#9CA3AF";
          let textColor = "#6B7280";
          
          if (mode === ViewMode.Ocean) {
              tickColor = "rgba(255,255,255,0.6)";
              textColor = tickVal >= 0 ? "#0EA5E9" : "#FFF"; // Blue text in sky, white in water
              if (tickVal === 0) textColor = "#0284C7";
          }
          if (mode === ViewMode.House) {
              tickColor = "#9CA3AF";
              textColor = "#4B5563";
          }

          return (
            <g key={tickVal}>
              {isHorizontal ? (
                <>
                  <line 
                    x1={pos} y1={dimensions.height / 2 - 8} 
                    x2={pos} y2={dimensions.height / 2 + 8} 
                    stroke={tickColor} strokeWidth={isZero ? 3 : 2}
                  />
                  <text 
                    x={pos} y={dimensions.height / 2 + 28} 
                    textAnchor="middle" fill={textColor} 
                    fontSize={14} fontWeight={isZero ? 'bold' : 'normal'}
                  >
                    {tickVal}
                  </text>
                </>
              ) : (
                 <>
                  <line 
                    x1={dimensions.width / 2 - 8} y1={pos} 
                    x2={dimensions.width / 2 + 8} y2={pos} 
                    stroke={tickColor} strokeWidth={isZero ? 3 : 2}
                  />
                  <text 
                    x={dimensions.width / 2 + 25} y={pos + 4} 
                    textAnchor="start" fill={textColor} 
                    fontSize={14} fontWeight={isZero ? 'bold' : 'normal'}
                  >
                    {tickVal}°
                  </text>
                </>
              )}
            </g>
          );
        })}

        {/* The Main Axis Line */}
         {isHorizontal ? (
          <line 
            x1={padding} y1={dimensions.height / 2} 
            x2={dimensions.width - padding} y2={dimensions.height / 2} 
            stroke={mode === ViewMode.Ocean ? "rgba(255,255,255,0.8)" : "#9CA3AF"} 
            strokeWidth={mode === ViewMode.General ? 2 : 4} 
            strokeLinecap="round"
          />
        ) : (
          <line 
            x1={dimensions.width / 2} y1={dimensions.height - padding} 
            x2={dimensions.width / 2} y2={padding} 
            stroke={mode === ViewMode.Ocean ? "rgba(255,255,255,0.3)" : "#9CA3AF"} 
            strokeWidth={mode === ViewMode.General ? 2 : 4} 
            strokeLinecap="round"
          />
        )}

        {renderDistance()}

        {/* Point A */}
        <g 
            style={{ cursor: 'grab', filter: 'drop-shadow(0px 4px 4px rgba(0,0,0,0.2))' }}
            onPointerDown={(e) => handlePointerDown(e, setPointA)}
            transform={`translate(${isHorizontal ? scale(pointA) : dimensions.width/2}, ${isHorizontal ? dimensions.height/2 : scale(pointA)})`}
        >
             <circle r={30} fill="transparent" />
             {getPointVisual('A', pointA)}
             {showValues && (
                <g transform={isHorizontal ? "translate(0, -50)" : "translate(-45, 5)"}>
                    <rect x={-18} y={-12} width={36} height={24} rx={12} fill="#EF4444" stroke="white" strokeWidth={2}/>
                    <text y={5} textAnchor="middle" fill="white" fontSize={14} fontWeight="bold">{pointA}</text>
                </g>
             )}
        </g>

        {/* Point B */}
        <g 
            style={{ cursor: 'grab', filter: 'drop-shadow(0px 4px 4px rgba(0,0,0,0.2))' }}
            onPointerDown={(e) => handlePointerDown(e, setPointB)}
            transform={`translate(${isHorizontal ? scale(pointB) : dimensions.width/2}, ${isHorizontal ? dimensions.height/2 : scale(pointB)})`}
        >
             <circle r={30} fill="transparent" />
             {getPointVisual('B', pointB)}
             {showValues && (
                <g transform={isHorizontal ? "translate(0, -50)" : "translate(-45, 5)"}>
                    <rect x={-18} y={-12} width={36} height={24} rx={12} fill="#3B82F6" stroke="white" strokeWidth={2}/>
                    <text y={5} textAnchor="middle" fill="white" fontSize={14} fontWeight="bold">{pointB}</text>
                </g>
             )}
        </g>
        
      </svg>
    </Box>
  );
};