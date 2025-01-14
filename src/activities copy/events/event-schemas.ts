import { z } from 'zod';
import { ActivityType } from '../enums/activity-type.enum';

// Define schemas
export const BoardAddedSchema = z.object({
  type: z.literal(ActivityType.BOARD_ADDED),
  user: z.object({ id: z.string() }),
  sourceBoard: z.object({ id: z.string() }),
});

export const CardAddedSchema = z.object({
  type: z.literal(ActivityType.CARD_ADDED),
  user: z.object({ id: z.string() }),
  sourceBoard: z.object({ id: z.string() }),
  card: z.object({ id: z.string() }),
  sourceListTitle: z.string(),
});

export const ListAddedSchema = z.object({
  type: z.literal(ActivityType.LIST_ADDED),
  user: z.object({ id: z.string() }),
  sourceBoard: z.object({ id: z.string() }),
});

// Combine schemas
export const EventSchemas = {
  BOARD_ADDED: BoardAddedSchema,
  CARD_ADDED: CardAddedSchema,
  LIST_ADDED: ListAddedSchema,
};

// Infer TypeScript types from schemas
export type EventPayloadMap = {
  BOARD_ADDED: z.infer<typeof BoardAddedSchema>;
  CARD_ADDED: z.infer<typeof CardAddedSchema>;
  LIST_ADDED: z.infer<typeof ListAddedSchema>;
};

// Discriminated union for all events
export type EventPayloadUnion = EventPayloadMap[keyof EventPayloadMap];
