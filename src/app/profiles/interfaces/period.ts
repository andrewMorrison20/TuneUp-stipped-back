export enum Period {
  ONE_HOUR = 'ONE_HOUR',
  TWO_HOURS = 'TWO_HOURS',
  HALF_HOUR = 'HALF_HOUR',
  QUARTER_HOUR = 'QUARTER_HOUR',
  THREE_QUARTERS_HOUR = 'THREE_QUARTERS_HOUR',
  ONE_AND_HALF_HOUR = 'ONE_AND_HALF_HOUR',
  ONE_AND_QUARTER_HOURS = 'ONE_AND_QUARTER_HOURS',
  ONE_THREE_QUARTER_HOURS = 'ONE_THREE_QUARTER_HOURS',
  TWO_AND_HALF_HOUR = 'TWO_AND_HALF_HOUR',
  TWO_AND_QUARTER_HOURS = 'TWO_AND_QUARTER_HOURS',
  TWO_THREE_QUARTER_HOURS = 'TWO_THREE_QUARTER_HOURS',
  CUSTOM = 'CUSTOM'
}

export const PeriodMap: { [key in Period]: string } = {
  [Period.ONE_HOUR]: '1 hour',
  [Period.TWO_HOURS]: '2 hours',
  [Period.HALF_HOUR]: '30 minutes',
  [Period.QUARTER_HOUR]: '15 minutes',
  [Period.THREE_QUARTERS_HOUR]: '45 minutes',
  [Period.ONE_AND_HALF_HOUR]: '1.5 hours',
  [Period.ONE_AND_QUARTER_HOURS]: '1.25 hours',
  [Period.ONE_THREE_QUARTER_HOURS]: '1.75 hours',
  [Period.TWO_AND_HALF_HOUR]: '2.5 hours',
  [Period.TWO_AND_QUARTER_HOURS]: '2.25 hours',
  [Period.TWO_THREE_QUARTER_HOURS]: '2.75 hours',
  [Period.CUSTOM]: 'CUSTOM'
};
