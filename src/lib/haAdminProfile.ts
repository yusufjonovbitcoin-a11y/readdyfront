export const HA_ADMIN_AVATAR_KEY = "ha-admin-profile-avatar";

/** Demo: profil surati brauzer localStorage da */
export function getHaAdminStoredAvatar(): string | null {
  try {
    return localStorage.getItem(HA_ADMIN_AVATAR_KEY);
  } catch {
    return null;
  }
}

export function haAdminInitialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

/** Sidebar va boshqa UI bir xil sessiyada avatarni yangilashi uchun */
export const HA_ADMIN_AVATAR_UPDATED_EVENT = "ha-admin-avatar-updated";

export function notifyHaAdminAvatarUpdated(): void {
  window.dispatchEvent(new CustomEvent(HA_ADMIN_AVATAR_UPDATED_EVENT));
}
