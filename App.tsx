import React, { useState, useEffect } from 'react';
import { motion, useAnimation, PanInfo } from 'framer-motion';
import { Box, Txt } from './components/SnowBox';
import { NumberLine } from './components/NumberLine';
import { Controls } from './components/Controls';
import { ViewMode, Orientation, ControlState } from './types';

const App: React.FC = () => {
  // --- State Management ---
  
  // Points
  const [pointA, setPointA] = useState<number>(-3);
  const [pointB, setPointB] = useState<number>(4);

  // Configuration
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.General);
  const [orientation, setOrientation] = useState<Orientation>(Orientation.Horizontal);
  
  // Controls
  const [controlState, setControlState] = useState<ControlState>({
    showValues: true,
    showDistance: true,
    showDescription: true,
    showFormula: true,
  });

  // Mobile Sheet State
  const [isSheetExpanded, setIsSheetExpanded] = useState(false);
  const sheetControls = useAnimation();

  // Handle Mode Change effects
  useEffect(() => {
    if (viewMode === ViewMode.Ocean || viewMode === ViewMode.Thermometer) {
      setOrientation(Orientation.Vertical);
    } else if (viewMode === ViewMode.House) {
      setOrientation(Orientation.Horizontal);
    }
  }, [viewMode]);

  const toggleControl = (key: keyof ControlState, val: boolean) => {
    setControlState(prev => ({ ...prev, [key]: val }));
  };

  const handleReset = () => {
    setPointA(-3);
    setPointB(4);
    setViewMode(ViewMode.General);
    setOrientation(Orientation.Horizontal);
    setControlState({
        showValues: true,
        showDistance: true,
        showDescription: false,
        showFormula: false,
    });
  };

  // Mobile Sheet Logic
  const SHEET_COLLAPSED_HEIGHT = 180; // Enough to see title + 2 rows of mode buttons
  const toggleSheet = () => {
      setIsSheetExpanded(prev => !prev);
  };
  
  useEffect(() => {
      // Animate based on state
      if (isSheetExpanded) {
          sheetControls.start({ y: 0 });
      } else {
          sheetControls.start({ y: "calc(100% - 180px)" });
      }
  }, [isSheetExpanded, sheetControls]);

  const onDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 100;
    if (info.offset.y < -threshold) {
        setIsSheetExpanded(true);
    } else if (info.offset.y > threshold) {
        setIsSheetExpanded(false);
    } else {
        // Revert to current state if drag wasn't strong enough
        if (isSheetExpanded) {
            sheetControls.start({ y: 0 });
        } else {
            sheetControls.start({ y: "calc(100% - 180px)" });
        }
    }
  };

  return (
    <Box w="100vw" h="100vh" bg="B020" className="flex flex-col md:flex-row overflow-hidden font-sans relative">
      
      {/* --- Visualization Area --- */}
      {/* 
         Desktop: flex-1, takes full remaining space.
         Mobile: absolute full screen, with padding bottom to avoid overlap with collapsed sheet.
      */}
      <Box className="absolute inset-0 md:relative md:flex-1 md:h-full w-full z-0 pb-[180px] md:pb-0">
         {/* Header / Title Overlay */}
         <Box absolute t={20} l={20} z={10} className="pointer-events-none">
            <Txt fw="bold" cl="T010" className="text-xl md:text-2xl drop-shadow-sm shadow-white">数轴：距离探究</Txt>
            <Txt cl="T020" mt={4} className="text-xs md:text-sm drop-shadow-sm shadow-white">拖动点来观察距离的变化</Txt>
         </Box>

         <NumberLine 
            mode={viewMode}
            orientation={orientation}
            pointA={pointA}
            pointB={pointB}
            setPointA={setPointA}
            setPointB={setPointB}
            showValues={controlState.showValues}
            showDistance={controlState.showDistance}
         />
      </Box>

      {/* --- Desktop Controls (Sidebar) --- */}
      {/* Hidden on small screens */}
      <Box className="hidden md:flex w-[340px] h-full z-20 relative">
        <Controls 
          viewMode={viewMode}
          setViewMode={setViewMode}
          orientation={orientation}
          setOrientation={setOrientation}
          controls={controlState}
          setControl={toggleControl}
          onReset={handleReset}
          pointA={pointA}
          pointB={pointB}
          isMobile={false}
        />
      </Box>

      {/* --- Mobile Controls (Bottom Sheet) --- */}
      {/* Visible only on small screens */}
      <motion.div
        className="md:hidden fixed bottom-0 left-0 right-0 bg-white z-50 rounded-t-2xl shadow-2xl h-[85vh] flex flex-col"
        initial={{ y: "calc(100% - 180px)" }}
        animate={sheetControls}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }} // Constraints are handled by onDragEnd manually for snap
        dragElastic={0.1}
        onDragEnd={onDragEnd}
      >
        {/* Drag Handle */}
        <Box row center w="100%" h={24} className="cursor-grab active:cursor-grabbing touch-none" onClick={toggleSheet}>
            <Box w={40} h={5} bg="gray-300" br={3} />
        </Box>

        {/* Content */}
        <Box flex={1} className="overflow-hidden">
            <Controls 
                viewMode={viewMode}
                setViewMode={setViewMode}
                orientation={orientation}
                setOrientation={setOrientation}
                controls={controlState}
                setControl={toggleControl}
                onReset={handleReset}
                pointA={pointA}
                pointB={pointB}
                isMobile={true}
                isExpanded={isSheetExpanded}
                onToggleExpand={toggleSheet}
            />
        </Box>
      </motion.div>

    </Box>
  );
};

export default App;