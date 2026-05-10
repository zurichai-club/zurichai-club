import { allSpeakersSchema, announcementSchema, singleSpeakerSchema } from "./schemas";
import { renderAllSpeakersTemplate } from "./templates/allSpeakers";
import { renderAnnouncementTemplate } from "./templates/announcement";
import { renderSingleSpeakerTemplate } from "./templates/singleSpeaker";

export type TemplateName = "single-speaker" | "all-speakers" | "announcement";

type RenderOptions = {
  width: number;
  height: number;
};

export function renderPosterHtml(
  template: TemplateName,
  input: unknown,
  options: RenderOptions
): string {
  if (template === "single-speaker") {
    return renderSingleSpeakerTemplate(singleSpeakerSchema.parse(input), options);
  }

  if (template === "all-speakers") {
    return renderAllSpeakersTemplate(allSpeakersSchema.parse(input), options);
  }

  if (template === "announcement") {
    return renderAnnouncementTemplate(announcementSchema.parse(input), options);
  }

  throw new Error(`Unsupported template: ${template}`);
}

export function isTemplateName(value: string): value is TemplateName {
  return value === "single-speaker" || value === "all-speakers" || value === "announcement";
}
