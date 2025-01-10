export const activityTemplates = {
  ADD_CARD: {
    textTemplate: '{user} added card {card}',
    placeholders: ['user', 'card'],
  },
  MOVE_CARD: {
    textTemplate:
      'User {user} moved card {card} from list {sourceList} to list {destinationList}',
    placeholders: ['user', 'card', 'sourceList', 'destinationList'],
  },
  TRANSFER_LIST: {
    textTemplate:
      'User {user} transferred list {list} from board {sourceBoard} to board {destinationBoard}',
    placeholders: ['user', 'list', 'sourceBoard', 'destinationBoard'],
  },
} as const;
