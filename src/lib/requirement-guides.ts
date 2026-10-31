// Simple preparation guidance. Check current requirements with the responsible office.
export type RequirementGuide = { agency: string; overview: string; prepare: string[]; actions: string[]; source: { label: string; url: string }[]; documentGroup?: string; };
export const requirementGuides: Record<string, RequirementGuide> = {
  'business-registration': {
    agency: 'DTI (sole owner) or SEC (corporation or partnership)',
    overview: 'If you own the business yourself, you usually register its name with DTI. Corporations and partnerships usually register with SEC. You may still need a city business permit before opening.',
    prepare: ['Decide if the business has one owner, partners, or a corporation.', 'Prepare your business name, owner details, and address.', 'Keep your approved DTI or SEC certificate. An application form is not proof of approval.'],
    actions: ['Apply through DTI or SEC, depending on your business type.', 'Wait for the official registration document.', 'Upload the approved document to your Document Vault.'],
    source: [{ label: 'DTI Business Name Registration System', url: 'https://bnrs.dti.gov.ph/' }, { label: 'SEC official website', url: 'https://www.sec.gov.ph/' }], documentGroup: 'registration'
  },
  'local-permit': {
    agency: 'Baguio City Business Permits and Licensing Office (BPLO)',
    overview: 'Businesses in Baguio City generally need a city business permit. The documents may be different for a new business and a renewal.',
    prepare: ['Your DTI or SEC registration details.', 'Your business address and what your business does.', 'Other documents requested by the city for your business type.'],
    actions: ['Open Baguio City’s official permit website.', 'Check the requirements for a new permit or renewal.', 'Keep your application reference and upload the approved permit when issued.'],
    source: [{ label: 'Baguio City eBPLS', url: 'https://ebpls.baguio.gov.ph/' }, { label: 'Baguio City official website', url: 'https://www.baguio.gov.ph/' }], documentGroup: 'local'
  },
  'tax-registration': {
    agency: 'Bureau of Internal Revenue (BIR)',
    overview: 'Businesses need to check their BIR registration and tax duties. The form depends on your business type. Sole owners generally use Form 1901; corporations and partnerships generally use Form 1903.',
    prepare: ['Your personal and business details.', 'The BIR form and identification documents that apply to you.', 'Details needed to set up your business invoices.'],
    actions: ['Check BIR’s registration instructions.', 'Complete your registration and confirm invoicing requirements.', 'Save your BIR Certificate of Registration (Form 2303) when issued.'],
    source: [{ label: 'BIR NewBizReg', url: 'https://web-services.bir.gov.ph/newbizreg/' }, { label: 'BIR official website', url: 'https://www.bir.gov.ph/' }], documentGroup: 'tax'
  },
  'premises': {
    agency: 'Baguio City offices for zoning, buildings, and occupancy',
    overview: 'Before opening, check if your chosen location can legally be used for your type of business. Renting a space does not automatically mean it is approved for every business activity.',
    prepare: ['Your full business address and planned activities.', 'A lease or proof that you can use the space, if needed.', 'Any available building or occupancy documents.'],
    actions: ['Ask the city if your business activity is allowed at that location.', 'Find out which location documents are required.', 'Save the documents that apply to your business.'],
    source: [{ label: 'Baguio City official website', url: 'https://www.baguio.gov.ph/' }, { label: 'Baguio City eBPLS', url: 'https://ebpls.baguio.gov.ph/' }], documentGroup: 'premises'
  },
  'sanitation': {
    agency: 'Baguio City Health Services Office',
    overview: 'If your business prepares, sells, or handles food, you may need food safety and health documents. Baguio City WorkPASS has a separate process for food handlers.',
    prepare: ['A description of how you prepare, store, or serve food.', 'Health certificates or food-handler records for staff, if required.', 'Sanitation permits or inspection records for the business, if required.'],
    actions: ['Check WorkPASS for staff health requirements.', 'Ask the city health office about sanitation permits and inspections.', 'Keep staff health records separate from the business sanitation documents.'],
    source: [{ label: 'Baguio City WorkPASS services', url: 'https://workpass.baguio.gov.ph/services' }, { label: 'Baguio City official website', url: 'https://www.baguio.gov.ph/' }], documentGroup: 'sanitation'
  },
  'safety': {
    agency: 'Bureau of Fire Protection (BFP)',
    overview: 'Your business may need a fire safety inspection and certificate. The requirements depend on your location and activities. An AI photo check cannot replace an official inspection.',
    prepare: ['Your business address and the type of activities done there.', 'Any existing fire safety or building documents.', 'Notes on safety problems you have already fixed.'],
    actions: ['Ask the local BFP office what inspection or certificate you need.', 'Fix any safety problems found.', 'Upload the official certificate when issued and track its expiration date.'],
    source: [{ label: 'Bureau of Fire Protection', url: 'https://bfp.gov.ph/' }], documentGroup: 'safety'
  }
};
