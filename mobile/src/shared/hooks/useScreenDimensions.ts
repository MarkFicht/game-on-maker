import { useEffect, useState } from 'react';
import { Dimensions, ScaledSize } from 'react-native';

// 'screen' (not 'window') = the full physical display. On Android, 'window'
// can exclude the system navigation bar, leaving a gap at the bottom of a
// pixel-sized full-bleed background — 'screen' always covers edge to edge.
export function useScreenDimensions(): ScaledSize {
  const [dims, setDims] = useState(() => Dimensions.get('screen'));
  useEffect(() => {
    const sub = Dimensions.addEventListener('change', ({ screen }) => setDims(screen));
    return () => sub.remove();
  }, []);
  return dims;
}
