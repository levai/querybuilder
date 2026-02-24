/**
 * 与 vue-querybuilder dev/demoData 一致（与 https://react-querybuilder.js.org/demo 对齐）
 */
import type { RuleGroupType, RuleType } from 'vue-querybuilder';
import { defaultOperators, generateID, toFullOption } from 'vue-querybuilder';

const musicalInstruments = [
  {
    label: 'Percussion instruments',
    options: [
      'Clapstick', 'Cowbell', 'Cymbal', 'Gong', 'Maraca', 'Marimba', 'More cowbell',
      'Spoon', 'Steelpan', 'Tambourine', 'Triangle', 'Vibraphone', 'Washboard',
      'Wood block', 'Wooden fish', 'Xylophone',
    ].map(s => ({ name: s.toLowerCase().replace(/\s+/g, '_'), label: s })),
  },
  {
    label: 'Membranophones',
    options: [
      'Barrel drum', 'Bass drum', 'Bongo drums', 'Conga', 'Drum', 'Drum kit',
      "Jew's harp", 'Octaban', 'Samphor', 'Snare drum', 'Timpani', 'Tom-tom',
    ].map(s => ({ name: s.toLowerCase().replace(/\s+/g, '_'), label: s })),
  },
  {
    label: 'Wind instruments',
    options: [
      'Accordion', 'Bagpipe', 'Bassoon', 'Clarinet', 'Flute', 'Harmonica',
      'Oboe', 'Recorder', 'Saxophone', 'Trumpet', 'Tuba',
    ].map(s => ({ name: s.toLowerCase().replace(/\s+/g, '_'), label: s })),
  },
  {
    label: 'Stringed instruments',
    options: [
      'Cello', 'Guitar', 'Harp', 'Piano', 'Violin', 'Ukulele',
    ].map(s => ({ name: s.toLowerCase().replace(/\s+/g, '_'), label: s })),
  },
  {
    label: 'Electronic instruments',
    options: [
      'Electric guitar', 'Electronic keyboard', 'Keyboard', 'Synthesizer', 'Theremin',
    ].map(s => ({ name: s.toLowerCase().replace(/\s+/g, '_'), label: s })),
  },
];

const validator = (r: RuleType) => !!r.value;

export const fields = (
  [
    { name: 'firstName', label: 'First Name', placeholder: 'Enter first name', validator },
    { name: 'lastName', label: 'Last Name', placeholder: 'Enter last name', defaultOperator: 'beginsWith', validator },
    { name: 'age', label: 'Age', inputType: 'number', valueEditorProps: { min: 0, max: 120, step: 1 }, validator },
    {
      name: 'isMusician',
      label: 'Is a musician',
      valueEditorType: 'checkbox',
      operators: defaultOperators.filter(op => op.name === '='),
      defaultValue: false,
    },
    {
      name: 'instrument',
      label: 'Primary instrument',
      valueEditorType: 'select',
      values: musicalInstruments,
      operators: defaultOperators.filter(op => op.name === '='),
    },
    {
      name: 'alsoPlays',
      label: 'Also plays',
      valueEditorType: 'multiselect',
      values: musicalInstruments,
      defaultValue: 'more_cowbell',
      operators: defaultOperators.filter(op => op.name === 'in'),
    },
    {
      name: 'tourStops',
      label: 'Tour stops',
      matchModes: true,
      subproperties: [
        { name: 'city', label: 'City' },
        { name: 'state', label: 'State/Province' },
        { name: 'venue', label: 'Venue' },
        { name: 'date', label: 'Date', inputType: 'date', datatype: 'date' },
        { name: 'country', label: 'Country' },
      ],
    },
    {
      name: 'gender',
      label: 'Gender',
      operators: defaultOperators.filter(op => op.name === '='),
      valueEditorType: 'radio',
      values: [
        { name: 'M', label: 'Male' },
        { name: 'F', label: 'Female' },
        { name: 'O', label: 'Other' },
      ],
    },
    { name: 'height', label: 'Height', validator },
    { name: 'job', label: 'Job', validator },
    { name: 'description', label: 'Description', valueEditorType: 'textarea' },
    { name: 'birthdate', label: 'Birth Date', inputType: 'date', datatype: 'date' },
    { name: 'datetime', label: 'Show Time', inputType: 'datetime-local', datatype: 'timestamp with time zone' },
    { name: 'alarm', label: 'Daily Alarm', inputType: 'time' },
    {
      name: 'groupedField1',
      label: 'Grouped Field 1',
      comparator: 'groupNumber',
      groupNumber: 'group1',
      valueSources: ['field', 'value'],
    },
    {
      name: 'groupedField2',
      label: 'Grouped Field 2',
      comparator: 'groupNumber',
      groupNumber: 'group1',
      valueSources: ['field', 'value'],
    },
    {
      name: 'groupedField3',
      label: 'Grouped Field 3',
      comparator: 'groupNumber',
      groupNumber: 'group1',
      valueSources: ['field', 'value'],
    },
    {
      name: 'groupedField4',
      label: 'Grouped Field 4',
      comparator: 'groupNumber',
      groupNumber: 'group1',
      valueSources: ['field', 'value'],
    },
  ]
).map(o => toFullOption(o));

export const initialQuery: RuleGroupType = {
  id: generateID(),
  combinator: 'and',
  not: false,
  rules: [
    { id: generateID(), field: 'firstName', value: 'Stev', operator: 'beginsWith' },
    { id: generateID(), field: 'lastName', value: 'Vai, Vaughan', operator: 'in' },
    { id: generateID(), field: 'age', operator: '>', value: '28' },
    {
      id: generateID(),
      combinator: 'or',
      rules: [
        { id: generateID(), field: 'isMusician', operator: '=', value: true },
        { id: generateID(), field: 'instrument', operator: '=', value: 'guitar' },
      ],
    },
    {
      id: generateID(),
      field: 'groupedField1',
      operator: '=',
      value: 'groupedField4',
      valueSource: 'field',
    },
    {
      id: generateID(),
      field: 'birthdate',
      operator: 'between',
      value: '1954-10-03,1960-06-06',
    },
  ],
};
