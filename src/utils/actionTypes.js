import changeCase from 'change-case';

export function toActionType(...blocks) {
  return changeCase.constantCase(blocks.join('_'));
}
