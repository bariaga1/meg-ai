import { OG_ALT, OG_SIZE, renderOgCard } from "@/lib/ogCard";

export const alt = OG_ALT;
export const size = OG_SIZE;
export const contentType = "image/png";

/** Link preview card for LinkedIn, Slack, iMessage and X. */
export default function TwitterImage() {
  return renderOgCard();
}
