import { View, StyleSheet, useColorScheme, Pressable, Text, TextInput, Button } from 'react-native';
import React, { useState, useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import ThemedText from '@/src/components/ThemedText';
import { Colors } from '@/src/constants/Colors';
import { ConfettiAnimation } from '@/src/components/animations/ConfettiAnimation';
import { hexToRgba } from '@/src/constants/Colors';
import { supabase } from '@/src/components/supabase/supabase';
import { StyledText } from '@/src/components/pairings/styled';

type Message = {
  text: string;
  user: string;
  timestamp: string;
}


export default function HomeScreen() {
  const colorScheme = useColorScheme() ?? 'dark'; // Set dark as default
  const theme = Colors[colorScheme];
  const [showConfetti, setShowConfetti] = useState(false);
  const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0 });
  const buttonRef = useRef<View>(null);
   const [message, setMessage] = useState('');
  const [user, setUser] = useState("john_doe");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const reanimatedTestRef = useRef<{ toggle: () => void } | null>(null);

  useEffect(() => {
    console.log('useEffect running - initializing channel');
    // Initialize the lobby channel
    const channel = supabase.channel('lobby', {
      config: { broadcast: { self: true } },
    });

    channel
      .on('broadcast', { event: 'message_sent' }, (payload) => {
        setMessages((prevMessages) => [...prevMessages, payload.payload]);
        reanimatedTestRef.current?.toggle();
      })
      .subscribe((status, err) => {
        console.log('Lobby channel status:', status, err ? `Error: ${err.message}` : '');
        setIsSubscribed(status === 'SUBSCRIBED');
      });

      if(!channel) {
        console.error('Channel initialization failed');
        return;
      }
   channelRef.current = channel;

    // Subscribe to global events channel (triggers from events table changes)
    const globalChannel = supabase.channel('events', { config: { private: true } })
      .on('broadcast', { event: 'INSERT' }, payload => console.log('global INSERT', payload))
      .on('broadcast', { event: 'UPDATE' }, payload => console.log('global UPDATE', payload))
      .on('broadcast', { event: 'DELETE' }, payload => console.log('global DELETE', payload))
      .subscribe((status, err) => {
        console.log('Global events channel status:', status, err ? `Error: ${err.message}` : '');
      });

    // Subscribe to a specific event id (replace with a real uuid from wha_data.events)
    const testEventId = 'e2841474-9aba-4e88-a5bc-f82462b73eb2';
    const perEventChannel = supabase.channel(`event:${testEventId}`, { config: { private: true } })
      .on('broadcast', { event: 'INSERT' }, payload => console.log('event INSERT', payload))
      .on('broadcast', { event: 'UPDATE' }, payload => console.log('event UPDATE', payload))
      .on('broadcast', { event: 'DELETE' }, payload => console.log('event DELETE', payload))
      .subscribe((status, err) => {
        console.log(`Per-event channel (${testEventId}) status:`, status, err ? `Error: ${err.message}` : '');
      });

    console.log('Subscribed to events. Waiting for broadcasts...');

    return () => {
      console.log('useEffect cleanup - removing channels');
      if (channel) supabase.removeChannel(channel);
      if (globalChannel) supabase.removeChannel(globalChannel);
      if (perEventChannel) supabase.removeChannel(perEventChannel);
    };
  }, []);

  const handleSend = async () => {
    if (!channelRef.current) {
      console.error("Channel not initialized");
      return;
    }

    if (!isSubscribed) {
      console.error("Channel not subscribed yet");
      return;
    }
    
    try {
      // Use channelRef.current here
      const result = await channelRef.current.send({
        type: 'broadcast',
        event: 'message_sent',
        payload: {
          text: message,
          user: user,
          timestamp: new Date().toISOString(),
        },
      });
      
      if (result === 'ok') {
        console.log('Message sent successfully');
        setMessage('');
      } else {
        console.error('Message send failed with status:', result);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleButtonPress = () => {
    // Measure button position for confetti origin
    buttonRef.current?.measureInWindow((x, y, width, height) => {
      setButtonPosition({ 
        x: x + width / 2,  // Center X
        y: y + height / 2   // Center Y
      });
      setShowConfetti(true);  // Trigger the animation
    });
  };

  const handleConfettiComplete = () => {
    setShowConfetti(false);  // Reset for next time
  };
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ThemedText type='title'>Home</ThemedText>
      <View style={[styles.separator, { backgroundColor: theme.secondary }]} />
      <ThemedText>Welcome to Warhammer 40k League</ThemedText>
      <ThemedText>Track your battles, achievements, and glory!</ThemedText>
      
      <Pressable 
        ref={buttonRef}
        style={[styles.testButton, { backgroundColor: hexToRgba(theme.tint, 0.9) }]}
        onPress={handleButtonPress}
      >
        <Text style={styles.buttonText}>🎉 Test Confetti Animation</Text>
      </Pressable>

            {/* Reanimated 4 test */}
      <ReanimatedTest ref={reanimatedTestRef} />
      <View style={{ margin: 16 }}>
        <StyledText variant="h1">Home</StyledText>
        
        {/* Cross-platform friendly TextInput */}
        <TextInput 
          placeholder="Username" 
          value={user}
          onChangeText={setUser} // React Native uses onChangeText
          style={{
            width: '100%',
            padding: 8,
            marginTop: 16,
            borderRadius: 4,
            borderColor: theme.secondary,
            borderWidth: 1,
            color: theme.text // Ensure text is visible
          }} 
        />
        <TextInput 
          placeholder="Type something..." 
          value={message}
          onChangeText={setMessage} // React Native uses onChangeText
          style={{
            width: '100%',
            padding: 8,
            marginTop: 16,
            borderRadius: 4,
            borderColor: theme.secondary,
            borderWidth: 1,
            color: theme.text // Ensure text is visible
          }} 
        />

        <View style={{ marginTop: 16 }}>
          <Button 
            title="Send Message"
            onPress={handleSend}
          />
        </View>
      </View>
       <View style={{ margin: 16 }}>
        <StyledText variant="h1">Messages</StyledText>
        {messages.map((msg, index) => (
          <StyledText key={index} style={{backgroundColor: msg.user === user ? theme.tint : theme.background, color: msg.user === user ? theme.text : theme.tint}}>{msg.user}: {msg.text}</StyledText>
        ))}

      </View>

    </View>
  );
}

const ReanimatedTest = forwardRef<{ toggle: () => void }, object>((_, ref) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const [inSlotB, setInSlotB] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const slotARef = useRef<View>(null);
  const slotBRef = useRef<View>(null);

  const boxSize = 80;

  const animStyle = useAnimatedStyle(() => ({
    width: boxSize,
    height: boxSize,
    backgroundColor: 'tomato',
    borderRadius: 8,
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  // Place the card at Slot A on first render
  useEffect(() => {
    const timer = setTimeout(() => {
      slotARef.current?.measureInWindow((x, y) => {
        translateX.value = x;
        translateY.value = y;
        setInitialized(true);
      });
    }, 100);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggle = () => {
    const toRef = inSlotB ? slotARef : slotBRef;

    toRef.current?.measureInWindow((tx, ty) => {
      const config = { duration: 400, easing: Easing.out(Easing.quad) };
      translateX.value = withTiming(tx, config);
      translateY.value = withTiming(ty, config);
      setInSlotB(!inSlotB);
    });
  };

  useImperativeHandle(ref, () => ({
    toggle,
  }));

  return (
    <View style={{ marginTop: 24, alignItems: 'center', gap: 12 }}>
      <Text style={{ color: '#fff', fontSize: 14 }}>Reanimated 4 FLIP Test</Text>
      <View style={{ flexDirection: 'row', width: 500, maxWidth: '100%', justifyContent: 'space-between' }}>
        <Pressable onPress={toggle}>
          <View
            ref={slotARef}
            style={{
              width: boxSize, height: boxSize,
              borderWidth: 2, borderColor: '#3b82f6',
              borderRadius: 8, borderStyle: 'dashed',
              justifyContent: 'center', alignItems: 'center',
            }}
          >
            <Text style={{ color: '#3b82f6', fontSize: 10 }}>Slot A</Text>
          </View>
        </Pressable>

        <Pressable onPress={toggle}>
          <View
            ref={slotBRef}
            style={{
              width: boxSize, height: boxSize,
              borderWidth: 2, borderColor: '#ef4444',
              borderRadius: 8, borderStyle: 'dashed',
              justifyContent: 'center', alignItems: 'center',
            }}
          >
            <Text style={{ color: '#ef4444', fontSize: 10 }}>Slot B</Text>
          </View>
        </Pressable>
      </View>

      {/* Animated card overlay - uses screen coordinates */}
      {initialized && (
        <Animated.View
          style={[
            { position: 'fixed' as any, top: 0, left: 0, zIndex: 9999, pointerEvents: 'none' },
            animStyle,
          ]}
        />
      )}
      
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  separator: {
    height: 1,
    width: '80%',
    marginVertical: 24,
  },
  testButton: {
    marginTop: 32,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
