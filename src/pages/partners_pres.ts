import type { APIRoute } from "astro";
import presentation from "../../meetup_sponsor_slides.html?raw";

export const GET: APIRoute = () =>
  new Response(presentation, {
    headers: {
      "Content-Type": "text/html; charset=utf-8"
    }
  });
