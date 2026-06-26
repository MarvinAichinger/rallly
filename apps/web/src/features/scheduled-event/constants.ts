export const isScheduledEventEnabled =
  process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test";

export const scheduledEventTag = (id: string) => `scheduled-event:${id}`;
