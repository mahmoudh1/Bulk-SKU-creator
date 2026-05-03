import type { PropsWithChildren } from "react";
import { createContext, useContext, useMemo } from "react";
import { useOrganization, useOrganizationList } from "@clerk/clerk-react";

export interface WorkspaceSummary {
  id: string;
  name: string;
  slug: string | null;
  imageUrl: string;
  membershipRole: string | null;
}

export interface OrganizationContextValue {
  isLoaded: boolean;
  activeWorkspace: WorkspaceSummary | null;
  workspaces: WorkspaceSummary[];
  setActiveWorkspace: (workspaceId: string) => Promise<void>;
}

const OrganizationContext = createContext<OrganizationContextValue | null>(null);

export function OrganizationProvider({ children }: PropsWithChildren) {
  const { isLoaded: isOrgLoaded, organization, membership } = useOrganization();
  const organizationListState = useOrganizationList({ userMemberships: true });
  const { isLoaded: isListLoaded, setActive, userMemberships } = organizationListState;
  const membershipData = userMemberships?.data;

  const value = useMemo<OrganizationContextValue>(() => {
    const isLoaded = isOrgLoaded && isListLoaded;
    const organizationList =
      membershipData ??
      (
        organizationListState as unknown as {
          organizationList?: Array<{
            organization: { id: string; name: string; slug: string | null; imageUrl: string };
            membership: { role: string | null };
          }>;
        }
      ).organizationList ??
      [];

    const workspaces =
      organizationList.map((entry) => ({
        id: entry.organization.id,
        name: entry.organization.name,
        slug: entry.organization.slug ?? null,
        imageUrl: entry.organization.imageUrl,
        membershipRole: ("membership" in entry ? entry.membership.role : entry.role) ?? null,
      })) ?? [];

    const activeWorkspace = organization
      ? {
          id: organization.id,
          name: organization.name,
          slug: organization.slug ?? null,
          imageUrl: organization.imageUrl,
          membershipRole: membership?.role ?? null,
        }
      : null;

    const setActiveWorkspace = async (workspaceId: string) => {
      if (!setActive) {
        return;
      }

      await setActive({ organization: workspaceId });
    };

    return {
      isLoaded,
      activeWorkspace,
      workspaces,
      setActiveWorkspace,
    };
  }, [isListLoaded, isOrgLoaded, membership?.role, membershipData, organization, organizationListState, setActive]);

  return <OrganizationContext.Provider value={value}>{children}</OrganizationContext.Provider>;
}

export function useOrganizationContext() {
  const ctx = useContext(OrganizationContext);

  if (!ctx) {
    throw new Error("useOrganizationContext must be used within <OrganizationProvider />");
  }

  return ctx;
}

