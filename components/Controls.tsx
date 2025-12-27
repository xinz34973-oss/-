import React from 'react';
import { Box, Txt } from './SnowBox';
import { ControlState, ViewMode, Orientation } from '../types';
import { RotateCcw, Settings, CheckSquare, Square, House, Globe, Thermometer, BoxSelect, Maximize2, Columns, ChevronUp, ChevronDown } from 'lucide-react';

interface ControlsProps {
  viewMode: ViewMode;
  setViewMode: (m: ViewMode) => void;
  orientation: Orientation;
  setOrientation: (o: Orientation) => void;
  controls: ControlState;
  setControl: (k: keyof ControlState, v: boolean) => void;
  onReset: () => void;
  pointA: number;
  pointB: number;
  isMobile?: boolean;
  onToggleExpand?: () => void;
  isExpanded?: boolean;
}

export const Controls: React.FC<ControlsProps> = ({
  viewMode,
  setViewMode,
  orientation,
  setOrientation,
  controls,
  setControl,
  onReset,
  pointA,
  pointB,
  isMobile = false,
  onToggleExpand,
  isExpanded
}) => {
  
  const ModeBtn = ({ mode, icon: Icon, label, emoji }: { mode: ViewMode, icon: any, label: string, emoji?: string }) => (
    <Box 
      row aI="center" p={10} br={12} mb={8}
      bg={viewMode === mode ? 'Brand' : 'B020'}
      onClick={() => setViewMode(mode)}
      className="hover:scale-[1.02] active:scale-95 transition-all border border-transparent hover:border-blue-200 cursor-pointer w-full"
    >
      <Box w={24} center>
        {emoji ? <Txt f={18}>{emoji}</Txt> : <Icon size={18} color={viewMode === mode ? '#FFF' : '#6B7280'} />}
      </Box>
      <Txt ml={10} f={14} fw="500" cl={viewMode === mode ? 'B010' : 'T010'}>{label}</Txt>
    </Box>
  );

  const CheckItem = ({ label, prop }: { label: string, prop: keyof ControlState }) => (
    <Box 
        row aI="center" mb={12} 
        onClick={() => setControl(prop, !controls[prop])}
        style={{ cursor: 'pointer' }}
        className="group"
    >
        <Box 
            className={`transition-colors ${controls[prop] ? '' : 'group-hover:bg-gray-200'} rounded`} 
            br={4}
        >
             {controls[prop] ? <CheckSquare size={20} color="#3B82F6" /> : <Square size={20} color="#9CA3AF" />}
        </Box>
        <Txt ml={8} f={14} cl="T010" className="group-hover:text-blue-600 transition-colors">{label}</Txt>
    </Box>
  );

  const distance = Math.abs(pointA - pointB);
  
  // Orientation controls are only available in General mode
  const showOrientationControls = viewMode === ViewMode.General;

  return (
    <Box 
      bg="B010" 
      className={`flex flex-col h-full w-full ${!isMobile ? 'border-l border-gray-100 shadow-2xl p-6' : 'p-4 rounded-t-2xl shadow-[0_-8px_30px_rgba(0,0,0,0.12)]'}`}
    >
      {/* Header */}
      <Box row aI="center" jC="space-between" mb={20} className="shrink-0" onClick={isMobile ? onToggleExpand : undefined}>
        <Box row aI="center">
            <Box p={8} bg="B020" br={12} mr={12}>
                <Settings size={24} color="#3B82F6" />
            </Box>
            <Box>
                <Txt f={20} fw="bold" cl="T010">控制面板</Txt>
                <Txt f={12} cl="T020">设置与观察</Txt>
            </Box>
        </Box>
        {isMobile && (
             <Box p={8}>
                 {isExpanded ? <ChevronDown size={24} color="#9CA3AF" /> : <ChevronUp size={24} color="#9CA3AF" />}
             </Box>
        )}
      </Box>

      {/* Scrollable Content Container */}
      {/* On Mobile, if not expanded, we hide the lower sections or use overflow hidden with fixed height */}
      <Box flex={1} className={`overflow-y-auto pr-1 pb-4 ${isMobile ? 'no-scrollbar' : ''}`}>
          
          {/* Mode Selection - Always Visible usually */}
          <Box mb={24}>
            <Txt f={12} fw="bold" cl="T030" mb={12} className="uppercase tracking-wider">场景模式</Txt>
            {/* Mobile: Grid 2x2, Desktop: Column */}
            <Box className={isMobile ? "grid grid-cols-2 gap-3" : "flex flex-col"}>
                <ModeBtn mode={ViewMode.General} icon={BoxSelect} label="通用" />
                <ModeBtn mode={ViewMode.House} icon={House} label="房屋" emoji="🏡" />
                <ModeBtn mode={ViewMode.Ocean} icon={Globe} label="海洋" emoji="🌊" />
                <ModeBtn mode={ViewMode.Thermometer} icon={Thermometer} label="温度计" emoji="🌡️" />
            </Box>
          </Box>

          <Box className={isMobile && !isExpanded ? 'hidden' : 'block'}>
              {/* Orientation - Only visible in General Mode */}
              {showOrientationControls && (
                <Box mb={24}>
                  <Txt f={12} fw="bold" cl="T030" mb={12} className="uppercase tracking-wider">数轴方向</Txt>
                  <Box row bg="B020" p={4} br={12}>
                      <Box 
                          flex={1} row center p={8} br={8}
                          bg={orientation === Orientation.Horizontal ? 'B010' : 'transparent'}
                          className={orientation === Orientation.Horizontal ? 'shadow-sm' : ''}
                          onClick={() => setOrientation(Orientation.Horizontal)}
                          style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                      >
                          <Maximize2 size={16} className="rotate-45" color={orientation === Orientation.Horizontal ? '#3B82F6' : '#6B7280'}/>
                          <Txt f={13} ml={6} fw="500" cl={orientation === Orientation.Horizontal ? 'Brand' : 'T020'}>水平</Txt>
                      </Box>
                      <Box 
                          flex={1} row center p={8} br={8}
                          bg={orientation === Orientation.Vertical ? 'B010' : 'transparent'}
                          className={orientation === Orientation.Vertical ? 'shadow-sm' : ''}
                          onClick={() => setOrientation(Orientation.Vertical)}
                          style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                      >
                          <Columns size={16} color={orientation === Orientation.Vertical ? '#3B82F6' : '#6B7280'}/>
                          <Txt f={13} ml={6} fw="500" cl={orientation === Orientation.Vertical ? 'Brand' : 'T020'}>垂直</Txt>
                      </Box>
                  </Box>
                </Box>
              )}

              {/* Toggles */}
              <Box mb={24}>
                <Txt f={12} fw="bold" cl="T030" mb={12} className="uppercase tracking-wider">显示选项</Txt>
                <Box className="grid grid-cols-2 gap-2">
                    <CheckItem label="点数值" prop="showValues" />
                    <CheckItem label="距离标签" prop="showDistance" />
                    <CheckItem label="描述文字" prop="showDescription" />
                    <CheckItem label="距离算式" prop="showFormula" />
                </Box>
              </Box>

              {/* Calculation Display */}
              {controls.showFormula && (
                  <Box mb={24} p={16} bg="blue-50" br={16} bWidth={1} bColor="blue-100">
                    <Txt f={12} fw="bold" cl="Brand" mb={8} className="uppercase tracking-wider">距离计算</Txt>
                    <Box row aI="center" wrap>
                      <Txt f={16} fw="500" cl="T010" className="font-mono">= | <span className="text-blue-600 font-bold">{pointB}</span> - <span className="text-red-600 font-bold">({pointA})</span> |</Txt>
                    </Box>
                    <Box w="100%" h={1} bg="blue-200" my={8} />
                    <Box row aI="center" jC="space-between">
                        <Txt f={13} cl="T020">结果</Txt>
                      <Txt f={20} fw="bold" cl="Brand" className="font-mono">
                          {distance}
                      </Txt>
                    </Box>
                  </Box>
              )}

              {/* Description */}
              {controls.showDescription && (
                  <Box mb={24} p={12} bg="gray-50" br={8}>
                      <Txt f={13} cl="T020" lh={20}>
                          {distance === 0 
                            ? "✨ 重合了！距离为 0。" 
                            : `💡 A 到 B 的距离是 ${distance}。`}
                      </Txt>
                  </Box>
              )}
              
              {/* Reset */}
               <Box 
                  row center p={14} bg="red-50" br={12} 
                  onClick={onReset}
                  className="hover:bg-red-100 active:scale-95 transition-all cursor-pointer border border-red-100 group shrink-0 mt-2 mb-8"
                >
                  <RotateCcw size={18} className="text-red-500 group-hover:-rotate-180 transition-transform duration-500" />
                  <Txt ml={10} f={15} fw="600" cl="Error">重置所有</Txt>
                </Box>
          </Box>
      </Box>

    </Box>
  );
};