import { router } from "../index";
import { clientsRouter } from "./clients";
import { deliverablesRouter } from "./deliverables";
import { feedbackRouter } from "./feedback";
import { invoicesRouter } from "./invoices";
import { notificationsRouter } from "./notifications";
import { projectsRouter } from "./projects";
import { teamRouter } from "./team";
import { workspaceRouter } from "./workspace";

export const appRouter = router({
	workspace: workspaceRouter,
	clients: clientsRouter,
	projects: projectsRouter,
	deliverables: deliverablesRouter,
	feedback: feedbackRouter,
	invoices: invoicesRouter,
	team: teamRouter,
	notifications: notificationsRouter,
});

export type AppRouter = typeof appRouter;
