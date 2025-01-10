export const createPart = (
  type: 'text' | 'link',
  content: string,
  referenceId?: string,
) => {
  return { type, content, referenceId };
};
