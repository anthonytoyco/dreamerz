import * as z from "zod";

export interface ActionResponse<T = unknown> {
  success: boolean;
  message: string;
  errors?: {
    [K in keyof T]?: string[];
  };
  inputs?: T;
}
export const formSchema = z.object({
  description: z.string({ error: "This field is required" }),
  location: z.string({ error: "This field is required" }),
  dateTime: z.date({
    error: "Please select a valid date and time",
  }),
  type: z
    .array(z.string(), { error: "Please select at least one item" })
    .min(1, "Please select at least one item"),
  recurring: z.boolean().default(false),
});
