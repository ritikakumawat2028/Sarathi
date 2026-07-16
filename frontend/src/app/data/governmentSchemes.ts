export interface GovernmentScheme {
  id: number;
  name: string;
  category: string;
  description: string;
  fullDescription: string;
  eligibility: string[];
  benefits: string;
  documents: string[];
  howToApply: string[];
  officialLink: string;
  ministry: string;
  eligible: boolean;
  isActive: boolean;
  source?: string;
}

// This static list is now used only as an OFFLINE FALLBACK for the Government Schemes
// page — see `GovernmentSchemes.tsx`, which fetches live data from the backend
// (`/api/schemes`, backed by `server/src/services/schemeSource.service.js`) and only
// falls back to this array if the backend is unreachable. Kept here (rather than deleted)
// so the app still shows real, verified scheme info with zero backend/network at all.
export const governmentSchemes: GovernmentScheme[] = [
  {
    id: 1,
    name: 'PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)',
    category: 'agriculture',
    description: 'Financial support to farmers across India',
    fullDescription: 'PM-KISAN is a Central Sector scheme to provide income support to all landholding farmers families across the country to supplement their financial needs for procuring various inputs related to agriculture and allied activities as well as domestic needs.',
    eligibility: [
      'Small and marginal farmers',
      'Landholding up to 2 hectares',
      'Indian citizen',
      'Land ownership documents required',
      'Aadhaar card mandatory'
    ],
    benefits: '₹6,000 per year in three equal installments of ₹2,000 each',
    documents: ['Aadhaar Card', 'Land ownership papers', 'Bank account details', 'Mobile number'],
    howToApply: [
      'Visit official PM-KISAN portal',
      'Click on "Farmers Corner"',
      'Select "New Farmer Registration"',
      'Fill Aadhaar number and captcha',
      'Enter all required details',
      'Upload documents',
      'Submit application'
    ],
    officialLink: 'https://pmkisan.gov.in/',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    eligible: false,
    isActive: true,
  },
  {
    id: 2,
    name: 'Ayushman Bharat - Pradhan Mantri Jan Arogya Yojana (PM-JAY)',
    category: 'health',
    description: 'World\'s largest health insurance scheme',
    fullDescription: 'Ayushman Bharat PM-JAY provides health cover of ₹5 lakhs per family per year for secondary and tertiary care hospitalization. It covers over 10.74 crore poor and vulnerable families.',
    eligibility: [
      'Economically weaker sections',
      'Families identified in SECC 2011 database',
      'No existing comprehensive health insurance',
      'Income criteria: Below ₹5 lakhs per annum',
      'Deprived and vulnerable categories included'
    ],
    benefits: '₹5 lakh health coverage per family per year for hospitalization',
    documents: ['Aadhaar Card', 'Ration Card', 'Income Certificate', 'Address Proof'],
    howToApply: [
      'Check eligibility on official website',
      'Visit nearest Common Service Centre (CSC)',
      'Provide Aadhaar and mobile number',
      'Get Ayushman card printed',
      'Use card at empanelled hospitals'
    ],
    officialLink: 'https://pmjay.gov.in/',
    ministry: 'Ministry of Health & Family Welfare',
    eligible: true,
    isActive: true,
  },
  {
    id: 3,
    name: 'National Scholarship Portal (NSP)',
    category: 'education',
    description: 'One-stop solution for various scholarship schemes',
    fullDescription: 'NSP is a one-stop solution through which various services starting from student application, application receipt, processing, sanction and payment to the students are enabled. Multiple scholarships are available for students from class 1 to post-graduation.',
    eligibility: [
      'Students from class 1 to post-graduation',
      'Merit-based and need-based scholarships',
      'Income criteria varies by scheme',
      'SC/ST/OBC/Minority students priority',
      'Minimum 50-60% marks in previous exam'
    ],
    benefits: 'Various scholarships ranging from ₹3,000 to ₹50,000 per year depending on course and category',
    documents: ['Aadhaar Card', 'Income Certificate', 'Caste Certificate (if applicable)', 'Bank account details', 'Mark sheets', 'Admission proof'],
    howToApply: [
      'Visit National Scholarship Portal',
      'Register with basic details',
      'Fill application form',
      'Upload required documents',
      'Submit to respective institution',
      'Track application status online'
    ],
    officialLink: 'https://scholarships.gov.in/',
    ministry: 'Ministry of Electronics & IT',
    eligible: true,
    isActive: true,
  },
  {
    id: 4,
    name: 'Pradhan Mantri Mudra Yojana (PMMY)',
    category: 'business',
    description: 'Loans for small businesses and micro-enterprises',
    fullDescription: 'PMMY provides loans up to ₹10 lakh to non-corporate, non-farm small/micro enterprises. These loans are given by Commercial Banks, RRBs, Small Finance Banks, MFIs and NBFCs.',
    eligibility: [
      'Non-corporate, non-farm small/micro enterprises',
      'Income generating activities in manufacturing, trading, services',
      'No existing business loans from banks',
      'Valid business plan or proposal',
      'Age: 18 years and above'
    ],
    benefits: 'Loans up to ₹10 lakh without collateral in three categories: Shishu (up to ₹50,000), Kishore (₹50,000 to ₹5 lakh), Tarun (₹5 lakh to ₹10 lakh)',
    documents: ['Aadhaar Card', 'PAN Card', 'Business plan', 'Address proof', 'Income proof', 'Bank statements'],
    howToApply: [
      'Prepare business plan',
      'Visit nearest bank branch',
      'Fill MUDRA loan application',
      'Submit documents',
      'Bank will assess and approve',
      'Loan disbursed to bank account'
    ],
    officialLink: 'https://www.mudra.org.in/',
    ministry: 'Ministry of Finance',
    eligible: false,
    isActive: true,
  },
  {
    id: 5,
    name: 'Pradhan Mantri Awas Yojana (PMAY)',
    category: 'housing',
    description: 'Housing for All - Affordable housing scheme',
    fullDescription: 'PMAY aims to provide affordable housing to urban and rural poor with a target of building 20 million affordable houses by 2022. Credit Linked Subsidy Scheme provides interest subsidy on home loans.',
    eligibility: [
      'Economically Weaker Section (EWS) - Annual income up to ₹3 lakh',
      'Low Income Group (LIG) - Annual income ₹3-6 lakh',
      'Middle Income Group (MIG) - Annual income ₹6-18 lakh',
      'First-time home buyer',
      'No pucca house in family name anywhere in India'
    ],
    benefits: 'Interest subsidy on home loans: EWS/LIG up to ₹2.67 lakh, MIG-I up to ₹2.35 lakh, MIG-II up to ₹2.30 lakh',
    documents: ['Aadhaar Card', 'Income Certificate', 'Property documents', 'Bank account details', 'Loan sanction letter'],
    howToApply: [
      'Apply for home loan with subsidy',
      'Visit PMAY portal',
      'Fill online application',
      'Provide Aadhaar for validation',
      'Submit to lending institution',
      'Subsidy credited upfront'
    ],
    officialLink: 'https://pmaymis.gov.in/',
    ministry: 'Ministry of Housing & Urban Affairs',
    eligible: false,
    isActive: true,
  },
  {
    id: 6,
    name: 'Skill India Mission - Pradhan Mantri Kaushal Vikas Yojana (PMKVY)',
    category: 'employment',
    description: 'Skill development and training for Indian youth',
    fullDescription: 'PMKVY is the flagship scheme of Ministry of Skill Development & Entrepreneurship. The objective is to enable Indian youth to take up industry-relevant skill training that will help them in securing a better livelihood.',
    eligibility: [
      'Indian citizen',
      'Youth aged 15-45 years (relaxation for special categories)',
      'Unemployed or school/college dropouts',
      'Class 10th or 12th pass (for some courses)',
      'Willing to undergo skill training'
    ],
    benefits: 'Free skill training, government certification, assessment and certification fee, average monetary reward of ₹8,000 per candidate, placement assistance',
    documents: ['Aadhaar Card', 'Educational certificates', 'Bank account details', 'Photograph'],
    howToApply: [
      'Visit Skill India portal',
      'Find training center near you',
      'Choose course based on interest',
      'Enroll at training center',
      'Complete training',
      'Get certified and placement support'
    ],
    officialLink: 'https://www.pmkvyofficial.org/',
    ministry: 'Ministry of Skill Development & Entrepreneurship',
    eligible: true,
    isActive: true,
  },
  {
    id: 7,
    name: 'Beti Bachao Beti Padhao',
    category: 'education',
    description: 'Girl child welfare and education scheme',
    fullDescription: 'BBBP addresses the declining Child Sex Ratio (CSR) and related issues of empowerment of girls and women over a life-cycle continuum. The scheme focuses on multi-sectoral action in around 640 districts.',
    eligibility: [
      'Girl child born in India',
      'Bank account in girl\'s name',
      'Age limit for opening account: 0-10 years',
      'One account per girl child',
      'Parents/guardians as account holders'
    ],
    benefits: 'Higher interest rates on savings, tax benefits under Section 80C, maturity amount for education and marriage',
    documents: ['Girl child birth certificate', 'Parents\' Aadhaar Card', 'Address proof', 'Photographs'],
    howToApply: [
      'Visit authorized bank/post office',
      'Fill account opening form',
      'Submit documents',
      'Minimum deposit of ₹1,000',
      'Can deposit up to ₹1.5 lakh per year',
      'Account matures when girl turns 21'
    ],
    officialLink: 'https://wcd.nic.in/bbbp-schemes',
    ministry: 'Ministry of Women & Child Development',
    eligible: false,
    isActive: true,
  },
  {
    id: 8,
    name: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
    category: 'agriculture',
    description: 'Crop insurance scheme for farmers',
    fullDescription: 'PMFBY provides insurance coverage and financial support to farmers in the event of failure of any of the notified crop as a result of natural calamities, pests & diseases.',
    eligibility: [
      'All farmers including sharecroppers and tenant farmers',
      'Compulsory for farmers with loans',
      'Voluntary for non-loanee farmers',
      'Farmers growing notified crops in notified areas',
      'Own or cultivated land'
    ],
    benefits: 'Premium: 2% for Kharif, 1.5% for Rabi, 5% for horticulture/commercial crops. Difference paid by government. Sum insured coverage for full crop value',
    documents: ['Land records', 'Aadhaar Card', 'Bank account details', 'Sowing certificate', 'Loan details (if applicable)'],
    howToApply: [
      'Visit nearest bank or CSC',
      'Register on PMFBY portal',
      'Choose crop and coverage',
      'Pay premium',
      'Get insurance policy',
      'Claim in case of crop loss'
    ],
    officialLink: 'https://pmfby.gov.in/',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    eligible: false,
    isActive: true,
  },
  {
    id: 9,
    name: 'Stand Up India Scheme',
    category: 'business',
    description: 'Loans for SC/ST and Women Entrepreneurs',
    fullDescription: 'Stand Up India Scheme facilitates bank loans between ₹10 lakh to ₹1 crore to at least one SC/ST borrower and at least one woman borrower per bank branch for setting up greenfield enterprise.',
    eligibility: [
      'SC/ST and/or women entrepreneur',
      'Age: Above 18 years',
      'Greenfield project in manufacturing, services or trading sector',
      'Loan for non-farm sector',
      'First-time entrepreneur'
    ],
    benefits: 'Loans between ₹10 lakh to ₹1 crore, Composite loan including term loan and working capital, Handholding support',
    documents: ['Aadhaar Card', 'PAN Card', 'Caste Certificate (for SC/ST)', 'Business plan', 'Educational certificates', 'Address proof'],
    howToApply: [
      'Prepare detailed business plan',
      'Visit www.standupmitra.in',
      'Register and apply online',
      'Submit to nearest bank branch',
      'Bank processes application',
      'Loan disbursed on approval'
    ],
    officialLink: 'https://www.standupmitra.in/',
    ministry: 'Ministry of Finance',
    eligible: false,
    isActive: true,
  },
  {
    id: 10,
    name: 'Atal Pension Yojana (APY)',
    category: 'social_security',
    description: 'Pension scheme for unorganized sector workers',
    fullDescription: 'APY is a government-backed pension scheme targeted at the unorganized sector. It provides guaranteed pension based on contribution and age of joining.',
    eligibility: [
      'Indian citizen aged 18-40 years',
      'Bank account holder',
      'Active mobile number',
      'Aadhaar card',
      'Not income tax payer'
    ],
    benefits: 'Guaranteed minimum pension of ₹1,000, ₹2,000, ₹3,000, ₹4,000 or ₹5,000 per month from age 60',
    documents: ['Aadhaar Card', 'Bank account details', 'Mobile number', 'Nominee details'],
    howToApply: [
      'Visit your bank branch',
      'Fill APY registration form',
      'Provide Aadhaar and bank details',
      'Choose pension amount',
      'Auto-debit set up for contributions',
      'Receive acknowledgement'
    ],
    officialLink: 'https://enps.nsdl.com/eNPS/NationalPensionSystem.html',
    ministry: 'Ministry of Finance',
    eligible: true,
    isActive: true,
  },
];
