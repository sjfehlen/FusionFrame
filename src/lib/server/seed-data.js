export const CATEGORIES = [
	{ scope: 'room', key: 'presence', label: 'Presence', sort_order: 1 },
	{ scope: 'room', key: 'light', label: 'Light', sort_order: 2 },
	{ scope: 'room', key: 'climate', label: 'Climate', sort_order: 3 },
	{ scope: 'room', key: 'networking', label: 'Networking', sort_order: 4 },
	{ scope: 'room', key: 'automations', label: 'Automations', sort_order: 5 },
	{ scope: 'room', key: 'sound', label: 'Sound', sort_order: 6 },
	{ scope: 'room', key: 'security', label: 'Security', sort_order: 7 },
	{ scope: 'room', key: 'non_tech', label: 'Non-tech', sort_order: 8 },

	{ scope: 'whole_home', key: 'networking', label: 'Networking', sort_order: 1 },
	{ scope: 'whole_home', key: 'electrical', label: 'Electrical', sort_order: 2 },
	{ scope: 'whole_home', key: 'hvac', label: 'HVAC', sort_order: 3 },
	{ scope: 'whole_home', key: 'plumbing', label: 'Plumbing / water', sort_order: 4 },
	{ scope: 'whole_home', key: 'structured_wiring', label: 'Structured wiring / low-voltage', sort_order: 5 },
	{ scope: 'whole_home', key: 'security', label: 'Security', sort_order: 6 },
	{ scope: 'whole_home', key: 'safety', label: 'Safety', sort_order: 7 },
	{ scope: 'whole_home', key: 'exterior', label: 'Exterior', sort_order: 8 },
	{ scope: 'whole_home', key: 'energy', label: 'Energy', sort_order: 9 }
];

export const ROOM_TYPES = [
	{ key: 'kitchen', label: 'Kitchen' },
	{ key: 'bathroom', label: 'Bathroom' },
	{ key: 'bedroom', label: 'Bedroom' },
	{ key: 'primary_bedroom', label: 'Primary Bedroom' },
	{ key: 'living_room', label: 'Living Room' },
	{ key: 'home_office', label: 'Home Office' },
	{ key: 'garage', label: 'Garage' },
	{ key: 'mechanical', label: 'Mechanical / Utility' },
	{ key: 'other', label: 'Other' }
];

// scope for every default below is always 'room' — room types only ever pre-populate room-scoped categories
export const ROOM_TYPE_DEFAULTS = [
	{ room_type_key: 'kitchen', category_key: 'non_tech' },
	{ room_type_key: 'kitchen', category_key: 'networking' },

	{ room_type_key: 'bathroom', category_key: 'non_tech' },
	{ room_type_key: 'bathroom', category_key: 'climate' },

	{ room_type_key: 'bedroom', category_key: 'presence' },
	{ room_type_key: 'bedroom', category_key: 'security' },
	{ room_type_key: 'bedroom', category_key: 'non_tech' },

	{ room_type_key: 'primary_bedroom', category_key: 'presence' },
	{ room_type_key: 'primary_bedroom', category_key: 'security' },
	{ room_type_key: 'primary_bedroom', category_key: 'non_tech' },

	{ room_type_key: 'living_room', category_key: 'sound' },
	{ room_type_key: 'living_room', category_key: 'networking' },
	{ room_type_key: 'living_room', category_key: 'light' },

	{ room_type_key: 'home_office', category_key: 'networking' },

	{ room_type_key: 'garage', category_key: 'security' },
	{ room_type_key: 'garage', category_key: 'climate' },
];

export const ROOM_TYPE_CHECKLIST_DEFAULTS = [
	{ room_type_key: 'kitchen', label: 'Range/oven' },
	{ room_type_key: 'kitchen', label: 'Refrigerator' },
	{ room_type_key: 'kitchen', label: 'Dishwasher' },
	{ room_type_key: 'kitchen', label: 'Vent hood' },
	{ room_type_key: 'kitchen', label: 'Garbage disposal' },
	{ room_type_key: 'kitchen', label: 'Sink' },

	{ room_type_key: 'bathroom', label: 'Vanity' },
	{ room_type_key: 'bathroom', label: 'Tub/shower' },
	{ room_type_key: 'bathroom', label: 'Toilet' },

	{ room_type_key: 'bedroom', label: 'Closet' },

	{ room_type_key: 'primary_bedroom', label: 'Walk-in closet' },
	{ room_type_key: 'primary_bedroom', label: 'Ensuite bath' },

	{ room_type_key: 'garage', label: 'EV charger circuit' }
];
