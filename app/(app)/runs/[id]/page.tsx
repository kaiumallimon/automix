import { RunStepDetailViewer } from "@/components/runs/run-step-detail-viewer";

export default async function RunDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <RunStepDetailViewer runId={id} />;
}
