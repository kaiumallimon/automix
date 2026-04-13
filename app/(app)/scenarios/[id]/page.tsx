import { StepEditor } from "@/components/scenario/step-editor";

export default async function ScenarioStepEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <StepEditor scenarioId={id} />;
}
