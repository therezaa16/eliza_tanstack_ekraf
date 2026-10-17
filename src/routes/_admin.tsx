import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";

import { DashboardShell } from "@/components/DashboardShell";
import { getMe } from "@/lib/server/auth";

export const Route = createFileRoute("/_admin")({
	beforeLoad: async () => {
		const me = await getMe();
		if (!me) {
			throw redirect({ to: "/login" });
		}
		return { me };
	},
	component: AdminLayout,
});

function AdminLayout() {
	const { me } = Route.useRouteContext();
	return (
		<DashboardShell me={me}>
			<Outlet />
		</DashboardShell>
	);
}
