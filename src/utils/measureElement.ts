import { Platform, findNodeHandle } from 'react-native';

interface MeasureResult {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Cross-platform element measurement utility
 * Uses getBoundingClientRect on web, measureInWindow on native
 */
export function measureElement(
  ref: any,
  callback: (result: MeasureResult) => void
): void {
  if (!ref) {
    console.error('measureElement: ref is null');
    callback({ x: 0, y: 0, width: 0, height: 0 });
    return;
  }

  if (Platform.OS === 'web') {
    // On web, we need to find the actual DOM element
    try {
      // Method 1: Try findNodeHandle (works in React Native Web)
      const nodeHandle = findNodeHandle(ref);

      if (nodeHandle && typeof (nodeHandle as any).getBoundingClientRect === 'function') {
        const rect = (nodeHandle as any).getBoundingClientRect();
        callback({
          x: rect.left,
          y: rect.top,
          width: rect.width,
          height: rect.height,
        });
        return;
      }

      // Method 2: Direct DOM access if ref is already a DOM element
      if (typeof ref.getBoundingClientRect === 'function') {
        const rect = ref.getBoundingClientRect();
        callback({
          x: rect.left,
          y: rect.top,
          width: rect.width,
          height: rect.height,
        });
        return;
      }

      // Method 3: Try accessing the underlying DOM node via internal properties
      // React Native Web sometimes uses different internal structures
      const possibleNodes = [
        ref._nativeTag,
        ref._node,
        ref.current,
        ref._internalFiberInstanceHandleDEV?.stateNode,
      ];

      for (const node of possibleNodes) {
        if (node && typeof node.getBoundingClientRect === 'function') {
          const rect = node.getBoundingClientRect();
          callback({
            x: rect.left,
            y: rect.top,
            width: rect.width,
            height: rect.height,
          });
          return;
        }
      }

      // Method 4: Fallback to measureInWindow if available
      if (typeof ref.measureInWindow === 'function') {
        ref.measureInWindow((x: number, y: number, width: number, height: number) => {
          callback({ x, y, width, height });
        });
        return;
      }

      // Method 5: Try measure() as last resort
      if (typeof ref.measure === 'function') {
        ref.measure((x: number, y: number, width: number, height: number, pageX: number, pageY: number) => {
          callback({ x: pageX, y: pageY, width, height });
        });
        return;
      }

      console.error('measureElement: Could not measure element on web. Ref type:', typeof ref, ref);
      callback({ x: 0, y: 0, width: 0, height: 0 });
    } catch (error) {
      console.error('measureElement error:', error);
      callback({ x: 0, y: 0, width: 0, height: 0 });
    }
  } else {
    // On native, use measureInWindow
    if (typeof ref.measureInWindow === 'function') {
      ref.measureInWindow((x: number, y: number, width: number, height: number) => {
        callback({ x, y, width, height });
      });
    } else if (typeof ref.measure === 'function') {
      ref.measure((x: number, y: number, width: number, height: number, pageX: number, pageY: number) => {
        callback({ x: pageX, y: pageY, width, height });
      });
    } else {
      console.error('measureElement: ref does not have measureInWindow or measure');
      callback({ x: 0, y: 0, width: 0, height: 0 });
    }
  }
}
