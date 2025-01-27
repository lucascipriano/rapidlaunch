"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
import { Skeleton } from "@/components/ui/skeleton";
import { useAwaitableTransition } from "@/hooks/use-awaitable-transition";
import {
    acceptOrgRequestAction,
    declineOrgRequestAction,
    type getOrgRequestsAction,
} from "@/server/actions/organization";
import { useMutation } from "@tanstack/react-query";
import { RefreshCcwIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

type OrgRequestsProps = {
    requests: Awaited<ReturnType<typeof getOrgRequestsAction>>;
};

export function OrgRequests({ requests }: OrgRequestsProps) {
    const router = useRouter();

    const [isPending, startAwaitableTransition] = useAwaitableTransition();

    const onRefresh = async () => {
        await startAwaitableTransition(() => {
            router.refresh();
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex w-full items-center justify-between">
                <h4 className="text-sm font-medium">People asking access</h4>

                <Button
                    disabled={isPending}
                    variant="outline"
                    size="iconSmall"
                    className="group"
                    onClick={onRefresh}
                >
                    <RefreshCcwIcon className="h-3.5 w-3.5 transition-transform duration-400 group-active:-rotate-45" />
                </Button>
            </div>

            <div className="space-y-4">
                {isPending ? (
                    <Skeleton className="h-[200px] w-full" />
                ) : (
                    <div className="grid gap-6">
                        {requests && requests.length > 0 ? (
                            requests.map((request) => (
                                <RequestItem
                                    key={request.id}
                                    request={request}
                                />
                            ))
                        ) : (
                            <p className="text-sm font-medium text-muted-foreground">
                                No requests
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

type RequestItemProps = {
    request: Awaited<ReturnType<typeof getOrgRequestsAction>>[0];
};

function RequestItem({ request }: RequestItemProps) {
    const router = useRouter();

    const [isAccepting, setIsAccepting] = useState(false);
    const [isDeclining, setIsDeclining] = useState(false);

    const [, startAwaitableTransition] = useAwaitableTransition();

    const { mutateAsync: acceptMutateAsync } = useMutation({
        mutationFn: () => acceptOrgRequestAction({ requestId: request.id }),
    });

    const onAccept = async () => {
        setIsAccepting(true);

        try {
            await acceptMutateAsync();

            await startAwaitableTransition(() => {
                router.refresh();
            });

            toast.success("Organization access granted");
        } catch (error) {
            toast.error(
                (error as { message?: string })?.message ??
                    "Organization access could not be granted",
            );
        } finally {
            setIsAccepting(false);
        }
    };

    const { mutateAsync: declineMutateAsync } = useMutation({
        mutationFn: () => declineOrgRequestAction({ requestId: request.id }),
    });

    const onDecline = async () => {
        setIsDeclining(true);

        try {
            await declineMutateAsync();

            await startAwaitableTransition(() => {
                router.refresh();
            });

            toast.success("Organization access declined");
        } catch (error) {
            toast.error(
                (error as { message?: string })?.message ??
                    "Organization access could not be declined",
            );
        } finally {
            setIsDeclining(false);
        }
    };

    return (
        <div className="flex items-center justify-between space-x-4">
            <div className="flex items-center space-x-4">
                <Avatar>
                    <AvatarImage src={request.user.image!} />
                    <AvatarFallback>
                        {request.user.name![0]!.toUpperCase() +
                            request.user.name![1]!.toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                <div>
                    <p className="text-sm font-medium leading-none">
                        {request.user.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                        {request.user.email}
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <Button
                    variant="destructive"
                    onClick={onDecline}
                    disabled={isDeclining}
                    className="gap-2"
                >
                    {isDeclining ? <Icons.loader className="h-4 w-4" /> : null}
                    <span>Decline</span>
                </Button>
                <Button
                    variant="secondary"
                    onClick={onAccept}
                    disabled={isAccepting}
                    className="gap-2"
                >
                    {isAccepting ? <Icons.loader className="h-4 w-4" /> : null}
                    <span>Accept</span>
                </Button>
            </div>
        </div>
    );
}
