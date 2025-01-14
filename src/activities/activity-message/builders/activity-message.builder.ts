import { ActivityMessagePartObject } from '../types/activity-message.type';

export class ActivityMessageBuilder {
  private parts: ActivityMessagePartObject[] = [];

  addText(content: string): ActivityMessageBuilder {
    this.parts.push({ type: 'text', content });
    return this;
  }

  addStyledText(content: string): ActivityMessageBuilder {
    this.parts.push({ type: 'styled-text', content });
    return this;
  }

  addLink(content: string, referenceId: string): ActivityMessageBuilder {
    this.parts.push({ type: 'link', content, referenceId });
    return this;
  }

  addUserLink(content: string, referenceId: string): ActivityMessageBuilder {
    this.parts.push({ type: 'user-link', content, referenceId });
    return this;
  }

  build() {
    const result = { parts: this.parts };
    this.reset(); // Automatically reset after building
    return result;
  }

  private reset() {
    this.parts = [];
  }
}
