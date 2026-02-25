import { permanentRedirect } from "next/navigation";

type PageProps = {
  params: { id: string };
};

export default async function QuizResultsPage({ params }: PageProps) {
  permanentRedirect(`/quiz?resultId=${params.id}`);
}

