import { createContext, useContext, useMemo, ReactNode } from 'react';
import { useMyEventRegistration } from '@/src/hooks/useMyEventRegistration';
import { EventRegistration } from '@/src/types/EventRegistration';
import { ArmyList } from '@/types/ArmyList';

type EventContextType = {
  registration: EventRegistration | null;
  eventTeamId: string | null;
  armyList: ArmyList | null;
  isRegistered: boolean;
  isCaptain: boolean;
  isEventAdmin: boolean;
  isLoading: boolean;
};

const EventContext = createContext<EventContextType | null>(null);

interface EventProviderProps {
  eventId: string | undefined;
  children: ReactNode;
}

export function EventProvider({ eventId, children }: EventProviderProps) {
  const { myRegistrationQuery } = useMyEventRegistration(eventId);
  const registration = myRegistrationQuery.data ?? null;

  const value = useMemo(() => ({
    registration,
    eventTeamId: registration?.teamId ?? null,
    armyList: registration?.armyList ?? null,
    isRegistered: !!registration,
    isCaptain: registration?.isCaptain ?? false,
    isEventAdmin: registration?.isAdmin ?? false,
    isLoading: myRegistrationQuery.isLoading,
  }), [registration, myRegistrationQuery.isLoading]);

  return (
    <EventContext.Provider value={value}>
      {children}
    </EventContext.Provider>
  );
}

export function useEventContext() {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error('useEventContext must be used within an EventProvider');
  }
  return context;
}
