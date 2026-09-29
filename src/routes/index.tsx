import { createFileRoute } from "@tanstack/react-router";
import { LoseGillGame } from "@/components/game/LoseGillGame";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Lose Gill Bates Money — AI Security Game" },
      { name: "description", content: "Drain a fictional fortune while learning how AI security risks work in this quick three-round game." },
      { property: "og:title", content: "Lose Gill Bates Money" },
      { property: "og:description", content: "Can you spot the AI attack that drains the most money? Play three quick rounds." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return <LoseGillGame />;
}
