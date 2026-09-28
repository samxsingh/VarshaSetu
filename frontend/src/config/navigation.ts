export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  sectionId?: string;
}

/**
 * Canonical public homepage navigation configuration.
 * Order matches the exact DOM section order:
 * 1. Home (#home)
 * 2. Intelligence (#intelligence)
 * 3. Workspaces (#workspaces)
 * 4. Method (#method)
 * 5. Trust (#trust)
 */
export const PUBLIC_NAVIGATION: readonly NavigationItem[] = [
  {
    id: 'home',
    label: 'Home',
    href: '#home',
    sectionId: 'home',
  },
  {
    id: 'intelligence',
    label: 'Intelligence',
    href: '#intelligence',
    sectionId: 'intelligence',
  },
  {
    id: 'workspaces',
    label: 'Workspaces',
    href: '#workspaces',
    sectionId: 'workspaces',
  },
  {
    id: 'method',
    label: 'Method',
    href: '#method',
    sectionId: 'method',
  },
  {
    id: 'trust',
    label: 'Trust',
    href: '#trust',
    sectionId: 'trust',
  },
] as const;

