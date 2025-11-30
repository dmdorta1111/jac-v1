const fs = require('fs');
const path = require('path');

// Read the stds.json
const stdsData = JSON.parse(fs.readFileSync('public/form-templates/stds.json', 'utf8'));
const standards = stdsData.standards;

// Helper to convert name to label (DOOR_THICKNESS -> Door Thickness)
function toLabel(name) {
  return name
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

// Helper to determine field type based on value
function getFieldType(value) {
  if (value === null) return { type: 'input', inputType: 'text' };
  if (typeof value === 'number') {
    if (Number.isInteger(value)) return { type: 'integer' };
    return { type: 'float' };
  }
  return { type: 'input', inputType: 'text' };
}

// Helper to create field
function createField(sectionId, name, value) {
  const fieldType = getFieldType(value);
  const field = {
    id: sectionId + '-' + name.toLowerCase().replace(/_/g, '-'),
    name: name,
    label: toLabel(name),
    required: false,
    ...fieldType
  };

  if (fieldType.type === 'integer') {
    field.placeholder = '0';
    field.defaultValue = value;
  } else if (fieldType.type === 'float') {
    field.placeholder = '0.00';
    field.defaultValue = value;
  } else {
    field.placeholder = '';
    field.defaultValue = value || '';
  }

  return field;
}

// Group standards into logical sections
const sections = [
  {
    id: 'stds-gaps-clearances',
    title: 'Gaps & Clearances',
    keys: ['HINGE_GAP', 'STRIKE_GAP', 'TOP_GAP', 'UNDERCUT', 'DOOR_GAP', 'CLOSURE_CHANNEL_CLEARANCE', 'CORE_CLEARANCE', 'CORE_EDGE_SPACE', 'DRYWALL_ALLOWANCE']
  },
  {
    id: 'stds-door-dimensions',
    title: 'Door Dimensions',
    keys: ['DOOR_THICKNESS', 'TOP_CHANNEL_DEPTH', 'BOTTOM_CHANNEL_DEPTH', 'TOP_CHANNEL_THICKNESS', 'BOTTOM_CHANNEL_THICKNESS', 'DOOR_WIDTH_ADJUSTMENT', 'DOOR_GAUGE', 'DOOR_GRADE', 'DOOR_CONSTRUCTION', 'TOP_EDGE', 'BOTTOM_EDGE', 'DOOR_EDGE_REINFORCEMENT']
  },
  {
    id: 'stds-frame-dimensions',
    title: 'Frame Dimensions',
    keys: ['STOPP', 'RABBET', 'XRABBET', 'RETURN', 'XRETURN', 'DW_RTRN', 'XDW_RTRN', 'MINIMUM_SOFFIT', 'HEAD_STOPP', 'SILL_STOPP', 'FACEE', 'XFACEE', 'HEAD', 'XHEAD', 'SILL', 'XSILL', 'TRANSOM_HEAD', 'FRAME_GAUGE', 'FRAME_GRADE', 'FRAME_FINISH', 'FRAME_CONSTRUCTION', 'SECTION']
  },
  {
    id: 'stds-hinge-settings',
    title: 'Hinge Settings',
    keys: ['MAXIMUM_HINGE_SPACING', 'TOP_HINGE', 'BOTTOM_HINGE', 'HINGE_HEIGHT', 'HINGE_THICKNESS', 'HINGE_EDGE_SHAPE', 'JAMB_HINGE_SETBACK', 'DOOR_HINGE_SETBACK', 'DOOR_FACE_SETBACK', 'BUTT_HINGE_HEIGHT_ALLOWANCE', 'BUTT_HINGE_WIDTH_ALLOWANCE', 'BUTT_HINGE_THICKNESS_ALLOWANCE', 'CONTINUOUS_HINGE_REINFORCEMENT', 'HINGES', 'HINGE_DIMENSION_METHOD']
  },
  {
    id: 'stds-strike-lock',
    title: 'Strike & Lock',
    keys: ['STRIKE_EDGE_SHAPE', 'PRIMARY_STRIKE_CENTER']
  },
  {
    id: 'stds-anchor-settings',
    title: 'Anchor Settings',
    keys: ['ANCHOR_TYPE', 'ANCHOR_JB_DIST', 'ANCHOR_JT_DIST', 'ANCHOR_JMAX', 'ANCHOR_HDJ_DIST', 'ANCHOR_HMAX', 'ANCHOR_RECESS', 'FLOOR_CLIPS', 'BASE_CLIPS']
  },
  {
    id: 'stds-closer-settings',
    title: 'Closer Settings',
    keys: ['CLOSER', 'CLOSER_TYPE', 'SURFACE_CLOSER_LENGTH', 'SURFACE_CLOSER_WIDTH', 'SURFACE_CLOSER_LENGTH_2', 'SURFACE_CLOSER_WIDTH_2', 'HS_LENGTH', 'HS_LENGTH_2', 'EQUAL_CLOSERS']
  },
  {
    id: 'stds-flush-bolt',
    title: 'Flush Bolt & Pull',
    keys: ['FLUSH_BOLT_CENTER_TOP', 'FLUSH_BOLT_CENTER_BOTTOM', 'FLUSH_PULL_CENTER', 'FLUSH_PULL_BACKSET']
  },
  {
    id: 'stds-push-pull',
    title: 'Push/Pull Plates',
    keys: ['PUSH_PULL_WIDTH', 'PUSH_PULL_HEIGHT', 'PUSH_PLATE_CENTER', 'PUSH_BAR_CENTER', 'PULL_PLATE_CENTER', 'PULL_PLATE_HEIGHT', 'EQUAL_PUSH_PULLS']
  },
  {
    id: 'stds-kick-plate',
    title: 'Kick Plate',
    keys: ['KICK_PLATE_WIDTH', 'KICK_PLATE_GAUGE']
  },
  {
    id: 'stds-dps-settings',
    title: 'DPS Settings',
    keys: ['DPS_LOCATION', 'DPS_POSITION', 'EQUAL_DPS']
  },
  {
    id: 'stds-glass-glazing',
    title: 'Glass & Glazing',
    keys: ['GLASS_SUPPLIER', 'GLASS_INSTALLER', 'GLASS_STOP_WIDTH', 'MAX_GLAZING_HOLE_SPACE', 'DOOR_LITE_TRIM_TYPE', 'DOOR_LITE_TRIM_GAUGE']
  },
  {
    id: 'stds-steel-stiffener',
    title: 'Steel Stiffener',
    keys: ['STEEL_STIFFENER_MATERIAL', 'STEEL_STIFFENER_GAUGE', 'STEEL_STIFFENER_INSULATION', 'STEEL_STIFFENER_WIDTH', 'MAXIMUM_STIFFENER_CTR']
  },
  {
    id: 'stds-weld-allowances',
    title: 'Weld Allowances',
    keys: ['FRAME_WELD_ALLOWANCE_FACE', 'FRAME_WELD_ALLOWANCE_FULLY']
  },
  {
    id: 'stds-finish',
    title: 'Finish Options',
    keys: ['BODY_SIDE_FINISH', 'COVER_SIDE_FINISH']
  },
  {
    id: 'stds-misc',
    title: 'Miscellaneous',
    keys: ['HEAD_GRAIN', 'MANUFACTURERS_LOCATIONS', 'MAT_TYPE', 'BEVEL', 'ASTRAGAL_WIDTH', 'ACTIVE_LEAF', 'SILENCER_HOLE_DIA', 'EQUAL_ELEVATIONS', 'CLOSED_BACK', 'WEEP_HOLES']
  }
];

// Build form template
const formTemplate = {
  formId: 'stds-form',
  itemType: 'standards',
  title: 'General Standards',
  description: 'SDI General Standards configuration from SO_TEMPLATE',
  sections: []
};

// Track which keys have been used
const usedKeys = new Set();

sections.forEach(section => {
  const fields = [];

  section.keys.forEach(key => {
    if (standards.hasOwnProperty(key)) {
      usedKeys.add(key);
      let value = standards[key];

      // Handle special case for MAXIMUM_HINGE_SPACING with two values
      if (typeof value === 'object' && value !== null && value.value !== undefined) {
        // Create two fields for this
        fields.push(createField(section.id, key, value.value));
        fields.push(createField(section.id, key + '_2', value.value2));
      } else {
        fields.push(createField(section.id, key, value));
      }
    }
  });

  if (fields.length > 0) {
    formTemplate.sections.push({
      id: section.id,
      title: section.title,
      fields: fields
    });
  }
});

// Check for any missed keys
const allKeys = Object.keys(standards);
const missedKeys = allKeys.filter(k => !usedKeys.has(k));
if (missedKeys.length > 0) {
  console.log('Note: Added', missedKeys.length, 'uncategorized fields to Miscellaneous section');
  const miscSection = formTemplate.sections.find(s => s.id === 'stds-misc');
  missedKeys.forEach(key => {
    let value = standards[key];
    if (typeof value === 'object' && value !== null && value.value !== undefined) {
      miscSection.fields.push(createField('stds-misc', key, value.value));
    } else {
      miscSection.fields.push(createField('stds-misc', key, value));
    }
  });
}

// Write the form template
const outputPath = 'public/form-templates/stds-form.json';
fs.writeFileSync(outputPath, JSON.stringify(formTemplate, null, 2));

console.log('Created:', outputPath);
console.log('Sections:', formTemplate.sections.length);
console.log('Total fields:', formTemplate.sections.reduce((sum, s) => sum + s.fields.length, 0));
