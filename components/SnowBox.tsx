import React, { forwardRef } from 'react';
import { BoxProps, TxtProps } from '../types';

/**
 * A layout component based on the "SnowBox" specification.
 * It maps concise props to inline styles for exact pixel values (simulating RN)
 * and uses Tailwind utility classes for colors and layout structure.
 */
export const Box = forwardRef<HTMLDivElement, BoxProps>(({
  children,
  flex,
  row,
  col,
  wrap,
  center,
  jC,
  aI,
  w, h,
  m, mt, mb, ml, mr, mx, my,
  p, pt, pb, pl, pr, px, py,
  bg,
  br,
  bWidth,
  bColor,
  className = '',
  style = {},
  onClick,
  relative,
  absolute,
  l, r, t, b,
  z,
}, ref) => {
  // Base classes
  const classes = [
    // Flex logic
    (flex || row || col || center || jC || aI) ? 'flex' : '',
    row ? 'flex-row' : '',
    col ? 'flex-col' : '',
    wrap ? 'flex-wrap' : '',
    center ? 'justify-center items-center' : '',
    relative ? 'relative' : '',
    absolute ? 'absolute' : '',
    className
  ].filter(Boolean).join(' ');

  // Direct Style Mapping for precise values (Simulating RN behavior on Web)
  const computedStyle: React.CSSProperties = {
    ...style,
    // Flex
    flex: typeof flex === 'number' ? flex : (flex ? 1 : undefined),
    justifyContent: jC,
    alignItems: aI,
    // Dimensions
    width: typeof w === 'number' ? `${w}px` : w,
    height: typeof h === 'number' ? `${h}px` : h,
    // Margins
    marginTop: mt ?? my ?? m,
    marginBottom: mb ?? my ?? m,
    marginLeft: ml ?? mx ?? m,
    marginRight: mr ?? mx ?? m,
    // Paddings
    paddingTop: pt ?? py ?? p,
    paddingBottom: pb ?? py ?? p,
    paddingLeft: pl ?? px ?? p,
    paddingRight: pr ?? px ?? p,
    // Background handling logic below...
    // Border
    borderRadius: br,
    borderWidth: bWidth,
    borderColor: bColor && !bColor.startsWith('#') ? `var(--color-${bColor})` : bColor,
    borderStyle: bWidth ? 'solid' : undefined,
    // Positioning
    left: l,
    right: r,
    top: t,
    bottom: b,
    zIndex: z,
  };

  // Improved BG Token handling
  let finalClassName = classes;
  const isToken = bg && ['B010', 'B020', 'B030', 'Brand', 'Error'].includes(bg);

  if (bg === 'B010') finalClassName += ' bg-B010';
  else if (bg === 'B020') finalClassName += ' bg-B020';
  else if (bg === 'B030') finalClassName += ' bg-B030';
  else if (bg === 'Brand') finalClassName += ' bg-Brand';
  else if (bg === 'Error') finalClassName += ' bg-Error';
  else if (bg) {
    // If not a recognized token class, apply as style
    computedStyle.backgroundColor = (!bg.startsWith('#') && !bg.startsWith('rgb')) ? `var(--color-${bg})` : bg;
  }

  return (
    <div ref={ref} className={finalClassName} style={computedStyle} onClick={onClick}>
      {children}
    </div>
  );
});

Box.displayName = 'Box';

export const Txt: React.FC<TxtProps> = ({
  children,
  f,
  fw,
  cl,
  lh,
  ls,
  align,
  className = '',
  style = {},
  m, mt, mb, ml, mr, mx, my,
}) => {
  const computedStyle: React.CSSProperties = {
    ...style,
    fontSize: f,
    fontWeight: fw,
    lineHeight: lh ? `${lh}px` : undefined,
    letterSpacing: ls,
    textAlign: align,
    // Margins
    marginTop: mt ?? my ?? m,
    marginBottom: mb ?? my ?? m,
    marginLeft: ml ?? mx ?? m,
    marginRight: mr ?? mx ?? m,
  };

  let finalClassName = className;
  // Map Color Tokens
  if (cl === 'T010') finalClassName += ' text-T010';
  else if (cl === 'T020') finalClassName += ' text-T020';
  else if (cl === 'T030') finalClassName += ' text-T030';
  else if (cl === 'Brand') finalClassName += ' text-Brand';
  else if (cl === 'Error') finalClassName += ' text-Error';
  else if (cl) computedStyle.color = cl;

  return (
    <span className={finalClassName} style={computedStyle}>
      {children}
    </span>
  );
};
