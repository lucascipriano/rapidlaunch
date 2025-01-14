import { Icons } from "@/components/ui/icons";
import { siteUrls } from "@/config/urls";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { UserDropdown } from "@/app/(app)/_components/user-dropdown";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Suspense } from "react";
import { buttonVariants } from "@/components/ui/button";
import { SidebarNav } from "@/app/(app)/_components/sidebar-nav";
import { getUser } from "@/server/auth";
import {
    OrgSelectDropdown,
    type UserOrgs,
} from "@/app/(app)/_components/org-select-dropdown";
import { getOrganizations } from "@/server/actions/organization";

type SideNavProps = {
    sidebarNavIncludeIds?: string[];
    sidebarNavRemoveIds?: string[];
    showOrgSwitcher?: boolean;
};

/**
 * @purpose The sidebar component contains the sidebar navigation and the user dropdown.
 * to add a new navigation item, you can add a new object to the navigation array in the @see /src/config/dashboard.ts file
 * to customize the user dropdown, you can add a new object to the navigation array in the @see /src/config/user-dropdown.ts file
 *
 * fell free to customize the sidebar component as you like
 */

export async function Sidebar({
    sidebarNavIncludeIds,
    sidebarNavRemoveIds,
    showOrgSwitcher = true,
}: SideNavProps) {
    const user = await getUser();

    const { currentOrg, userOrgs } = await getOrganizations();

    const myOrgs = userOrgs.filter((org) => org.ownerId === user?.id);
    const sharedOrgs = userOrgs.filter((org) => org.ownerId !== user?.id);

    const urgOrgsData: UserOrgs[] = [
        {
            heading: "My Orgs",
            items: myOrgs,
        },
        {
            heading: "Shared Orgs",
            items: sharedOrgs,
        },
    ];

    return (
        <aside className={cn("h-full w-full")}>
            <div className={cn(" flex h-16 items-center justify-between")}>
                <Link
                    href={siteUrls.home}
                    className={cn("z-10 transition-transform hover:scale-90")}
                >
                    <Icons.logo
                        className="text-xl"
                        iconProps={{ className: "w-6 h-6 fill-primary" }}
                    />
                </Link>
            </div>

            <div className="py-2">
                <Suspense
                    fallback={
                        <button
                            aria-disabled
                            disabled
                            className={buttonVariants({
                                variant: "outline",
                                className: "w-full",
                            })}
                        >
                            <Icons.loader className="h-4 w-4" />
                        </button>
                    }
                >
                    <UserDropdown user={user} />
                </Suspense>
            </div>

            {showOrgSwitcher && (
                <div className="py-2">
                    <Suspense
                        fallback={
                            <button
                                aria-disabled
                                disabled
                                className={buttonVariants({
                                    variant: "outline",
                                    className: "w-full",
                                })}
                            >
                                <Icons.loader className="h-4 w-4" />
                            </button>
                        }
                    >
                        <OrgSelectDropdown
                            userOrgs={urgOrgsData}
                            currentOrg={currentOrg}
                        />
                    </Suspense>
                </div>
            )}

            <ScrollArea style={{ height: "calc(100vh - 10.5rem)" }}>
                <div className="h-full w-full py-2">
                    <SidebarNav
                        sidebarNavIncludeIds={sidebarNavIncludeIds}
                        sidebarNavRemoveIds={sidebarNavRemoveIds}
                    />
                    <ScrollBar orientation="vertical" />
                </div>
            </ScrollArea>
        </aside>
    );
}
