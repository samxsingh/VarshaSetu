import { UserRole } from '@shared/types';

export interface DemoPersona {
  role: UserRole;
  label: string;
  hindiLabel: string;
  description: string;
  designation: string;
  defaultPath: string;
  name: string;
  phone: string;
  password: string;
  tagColor: string;
}

/**
 * Isolated development demonstration credentials.
 * Guarded strictly by import.meta.env.DEV:
 * In production Vite builds, import.meta.env.DEV is statically replaced with `false`,
 * enabling full Dead Code Elimination (DCE) to drop all demo credentials from the production bundle.
 */
export const DEV_DEMO_PERSONAS: DemoPersona[] = import.meta.env.DEV
  ? [
      {
        role: 'FARMER',
        label: 'Farmer',
        hindiLabel: 'किसान',
        description: 'Access weather intelligence, forecasts, advisories, and farm decision support.',
        designation: 'Panchayat Bhaisamau, Bakshi Ka Talab',
        defaultPath: '/farmer/dashboard',
        name: 'Ramesh Kumar',
        phone: '+919876543210',
        password: 'FarmerPassword123!',
        tagColor: 'bg-emerald-50 text-emerald-800 border-emerald-300',
      },
      {
        role: 'OFFICER',
        label: 'Officer',
        hindiLabel: 'कृषि अधिकारी',
        description: 'Monitor field conditions, operational signals, and inspection workflows.',
        designation: 'District Agricultural Officer, Lucknow',
        defaultPath: '/officer/dashboard',
        name: 'Dr. Arvind Sharma',
        phone: '+919876543211',
        password: 'OfficerPassword123!',
        tagColor: 'bg-blue-50 text-blue-800 border-blue-300',
      },
      {
        role: 'GOVERNMENT',
        label: 'Government',
        hindiLabel: 'राज्य योजना',
        description: 'Monitor district/state-level agricultural and climate intelligence.',
        designation: 'Joint Director Met, Uttar Pradesh',
        defaultPath: '/government/dashboard',
        name: 'Sunita Verma',
        phone: '+919876543212',
        password: 'GovPassword123!',
        tagColor: 'bg-cyan-50 text-cyan-800 border-cyan-300',
      },
      {
        role: 'ANALYST',
        label: 'Analyst',
        hindiLabel: 'विश्लेषक लैब',
        description: 'Analyze climate data, model behavior, data health, and scientific signals.',
        designation: 'Climate Data Scientist, Met Operations',
        defaultPath: '/analyst',
        name: 'Vikram Patel',
        phone: '+919876543213',
        password: 'AnalystPassword123!',
        tagColor: 'bg-purple-50 text-purple-800 border-purple-300',
      },
      {
        role: 'ADMIN',
        label: 'Administrator',
        hindiLabel: 'प्रशासक',
        description: 'Superuser governance, cross-workspace operations, and platform health.',
        designation: 'VarshaSetu System Administrator',
        defaultPath: '/admin',
        name: 'VarshaSetu Administrator',
        phone: '+919876543214',
        password: 'AdminPassword123!',
        tagColor: 'bg-rose-50 text-rose-800 border-rose-300',
      },
    ]
  : [];

export const IS_DEMO_ENABLED = DEV_DEMO_PERSONAS.length > 0;
