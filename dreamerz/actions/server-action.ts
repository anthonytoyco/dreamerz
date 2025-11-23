"use server";
import { actionClient } from "./safe-action";
import { formSchema } from "../lib/form-schema";
import { generateDreamName } from "@/app/api/gemini/name/nameservice";
import { createClient } from "@/lib/supabase/server";

export const serverAction = actionClient
  .inputSchema(formSchema)
  .action(async ({ parsedInput }) => {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        message: "User not authenticated",
      };
    }

    // do something with the data
    let name = parsedInput.name;
    if (!name && parsedInput.description) {
      try {
        name = await generateDreamName(parsedInput.description);
      } catch (error) {
        console.error("Failed to generate dream name:", error);
        name = "Untitled Dream";
      }
    }

    const dataToSave = {
      user_id: user.id,
      date_time: parsedInput.dateTime,
      description: parsedInput.description,
      longitude: parsedInput.longitude,
      latitude: parsedInput.latitude,
      name: name,
    };
    console.log(dataToSave);
    return {
      success: true,
      message: "Form submitted successfully",
    };
  });
