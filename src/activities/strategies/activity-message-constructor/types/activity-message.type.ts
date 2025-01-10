type ActivityMessagePartType = 'text' | 'styled-text' | 'link';

export type ActivityMessagePartObject = {
  type: ActivityMessagePartType;
  content: string;
  referenceId?: string;
};
