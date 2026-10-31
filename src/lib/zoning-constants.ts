export const BUSINESS_CATEGORIES=[
 {id:'sari_sari',label:'Sari-sari / neighborhood store'},
 {id:'grocery',label:'Grocery / convenience store'},
 {id:'eatery',label:'Eatery / restaurant'},
 {id:'cafe',label:'Café / coffee shop'},
 {id:'retail',label:'Retail shop'},
 {id:'barber',label:'Barber / salon'},
 {id:'tailoring',label:'Tailoring / dressmaking'},
 {id:'bakery',label:'Bakery'},
 {id:'boarding',label:'Boarding house / transient'},
 {id:'hotel',label:'Hotel / lodging'},
 {id:'office',label:'Professional office'},
 {id:'repair',label:'Repair shop'},
 {id:'manufacturing',label:'Fabrication / manufacturing'},
 {id:'other',label:'Other (describe below)'}
] as const;
export type Category=typeof BUSINESS_CATEGORIES[number]['id'];

