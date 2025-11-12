import WebDrawer from '@/src/components/navigation/WebDrawer';
import { useWindowDimensions } from 'react-native';
import { useEffect, useState } from 'react';
import DeviceTabs from '@/src/components/navigation/DeviceTabs';

const MOBILE_BREAKPOINT = 768;

export default function TabLayout() {
  const { width } = useWindowDimensions();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null; // Prevents hydration mismatch
  }

  const isMobileWeb = width < MOBILE_BREAKPOINT;

  if(!isMobileWeb){
    return <WebDrawer />
  }
  else{
    return <DeviceTabs />
  }
}