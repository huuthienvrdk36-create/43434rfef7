// Platform Events - единая точка определения всех событий
export enum PlatformEvent {
  // Quote events
  QUOTE_CREATED = 'QUOTE_CREATED',
  QUOTE_RESPONDED = 'QUOTE_RESPONDED',
  QUOTE_ACCEPTED = 'QUOTE_ACCEPTED',
  QUOTE_CANCELLED = 'QUOTE_CANCELLED',
  QUOTE_EXPIRED = 'QUOTE_EXPIRED',

  // Booking events
  BOOKING_CREATED = 'BOOKING_CREATED',
  BOOKING_CONFIRMED = 'BOOKING_CONFIRMED',
  BOOKING_STARTED = 'BOOKING_STARTED',
  BOOKING_COMPLETED = 'BOOKING_COMPLETED',
  BOOKING_CANCELLED = 'BOOKING_CANCELLED',
  BOOKING_NO_SHOW = 'BOOKING_NO_SHOW',

  // Organization events
  ORGANIZATION_VERIFIED = 'ORGANIZATION_VERIFIED',
  ORGANIZATION_SUSPENDED = 'ORGANIZATION_SUSPENDED',

  // User events
  USER_REGISTERED = 'USER_REGISTERED',
  USER_BLOCKED = 'USER_BLOCKED',
}

export interface EventPayload {
  event: PlatformEvent;
  timestamp: Date;
  data: Record<string, any>;
  meta?: {
    userId?: string;
    organizationId?: string;
    branchId?: string;
    cityId?: string;
  };
}
