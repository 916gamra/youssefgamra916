import type { User } from './db';

export type PortalType = 'PDR' | 'PREVENTIVE' | 'ORGANIZATION' | 'FACTORY' | 'ANALYTICS' | 'SETTINGS' | 'HOME';

/**
 * Roles that have administrative privileges across the entire system.
 */
export const ADMIN_ROLES = ['Admin', 'Super Administrator', 'Manager'];

/**
 * Check if a user has administrative privileges.
 * Primary users are always admins.
 */
export function isUserAdmin(user: User | null): boolean {
  if (!user) return false;
  if (user.isPrimary) return true;
  return ADMIN_ROLES.includes(user.role);
}

/**
 * Check if a user is allowed to access a specific portal.
 */
export function hasPortalAccess(user: User | null, portalId: string): boolean {
  if (!user) return false;
  if (user.isPrimary) return true;
  if (portalId === 'HOME') return true;

  // The 'SETTINGS' portal should generally be restricted to admins
  if (portalId === 'SETTINGS') {
    return isUserAdmin(user);
  }

  // Check allowedPortals list
  if (!user.allowedPortals) {
    // Fail-safe: If no portals are defined, default to basic operational portals
    // for Technicians/Engineers, but DO NOT include SETTINGS for anyone else.
    const defaultPortals = ['PDR', 'PREVENTIVE'];
    return defaultPortals.includes(portalId);
  }

  return user.allowedPortals.includes(portalId);
}
