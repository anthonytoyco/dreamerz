"use client";
import * as z from "zod";
import { formSchema } from "@/lib/form-schema";
import { serverAction } from "@/actions/server-action";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { useAction } from "next-safe-action/hooks";
import { motion } from "motion/react";
import { Check } from "lucide-react";
import {
  Field,
  FieldGroup,
  FieldContent,
  FieldLabel,
  FieldDescription,
  FieldError,
} from "@/components/ui/field";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon } from "lucide-react";
import {
  MultiSelect,
  MultiSelectContent,
  MultiSelectItem,
  MultiSelectTrigger,
  MultiSelectValue,
} from "@/components/ui/multi-select";
import { Switch } from "@/components/ui/switch";

type Schema = z.infer<typeof formSchema>;

export function DreamForm() {
  const form = useForm<Schema>({
    resolver: zodResolver(formSchema as any),
    defaultValues: {
      description: "",
      location: "",
      type: [],
      recurring: false,
    },
  });
  const formAction = useAction(serverAction, {
    onSuccess: () => {
      // TODO: show success message
      form.reset();
    },
    onError: () => {
      // TODO: show error message
    },
  });
  const handleSubmit = form.handleSubmit(async (data: Schema) => {
    formAction.execute(data);
  });

  const { isExecuting, hasSucceeded } = formAction;
  if (hasSucceeded) {
    return (
      <div className="p-2 sm:p-5 md:p-8 w-full rounded-md gap-2 border">
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, stiffness: 300, damping: 25 }}
          className="h-full py-6 px-3"
        >
          <motion.div
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{
              delay: 0.3,
              type: "spring",
              stiffness: 500,
              damping: 15,
            }}
            className="mb-4 flex justify-center border rounded-full w-fit mx-auto p-2"
          >
            <Check className="size-8" />
          </motion.div>
          <h2 className="text-center text-2xl text-pretty font-bold mb-2">
            Thank you
          </h2>
          <p className="text-center text-lg text-pretty text-muted-foreground">
            Form submitted successfully, we will get back to you soon
          </p>
        </motion.div>
      </div>
    );
  }
  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col p-2 sm:p-5 md:p-8 w-full rounded-md gap-2 border"
    >
      <FieldGroup>
        <h1 className="mt-6 mb-1 font-extrabold text-3xl tracking-tight">
          Upload Dream
        </h1>

        <Controller
          name="description"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="gap-1">
              <FieldLabel htmlFor="description">Description *</FieldLabel>
              <Textarea
                {...field}
                aria-invalid={fieldState.invalid}
                id="description"
                placeholder="Enter your text"
              />
              <FieldDescription>
                Describe your dream as best as you can
              </FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="location"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="gap-1">
              <FieldLabel htmlFor="location">Location *</FieldLabel>
              <Input
                {...field}
                id="location"
                type="text"
                onChange={(e) => {
                  field.onChange(e.target.value);
                }}
                aria-invalid={fieldState.invalid}
                placeholder="Toronto, Canada"
              />
              <FieldDescription>
                The city and country where this dream took place
              </FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="dateTime"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="gap-1">
              <FieldLabel htmlFor="dateTime">
                Date and Time of Dream *
              </FieldLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {field.value ? (
                      format(field.value, "PPP HH:mm")
                    ) : (
                      <span>Pick a date and time</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-[--radix-popover-trigger-width] p-0"
                  align="start"
                >
                  <Calendar
                    mode="single"
                    fixedWeeks
                    selected={field.value}
                    onSelect={(date) => {
                      if (!date) return;
                      const newDate = new Date(date);
                      if (field.value) {
                        newDate.setHours(field.value.getHours());
                        newDate.setMinutes(field.value.getMinutes());
                      }
                      newDate.setSeconds(0);
                      newDate.setMilliseconds(0);
                      field.onChange(newDate);
                    }}
                    initialFocus
                    className="w-full"
                  />
                  <div className="p-3 border-t border-border">
                    <Input
                      type="time"
                      step="60"
                      value={field.value ? format(field.value, "HH:mm") : ""}
                      onChange={(e) => {
                        const time = e.target.value;
                        if (!time) return;
                        const [hours, minutes] = time.split(":").map(Number);
                        const newDate = field.value
                          ? new Date(field.value)
                          : new Date();
                        newDate.setHours(hours);
                        newDate.setMinutes(minutes);
                        newDate.setSeconds(0);
                        newDate.setMilliseconds(0);
                        field.onChange(newDate);
                      }}
                    />
                  </div>
                </PopoverContent>
              </Popover>
              <FieldDescription>
                When did your dream take place?
              </FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="type"
          control={form.control}
          render={({ field, fieldState }) => {
            const options = [
              { value: "normal", label: "Normal" },
              { value: "nightmare", label: "Nightmare" },
              { value: "lucid", label: "Lucid" },
              { value: "sleep paralysis", label: "Sleep Paralysis" },
              { value: "daydream", label: "Daydream" },
            ];
            return (
              <Field
                data-invalid={fieldState.invalid}
                className="gap-0 [&_p]:pb-1"
              >
                <FieldLabel htmlFor="type">Dream Type *</FieldLabel>
                <FieldDescription>
                  What type of dream did you have?
                </FieldDescription>
                <MultiSelect
                  values={field.value ?? []}
                  onValuesChange={(value) => field.onChange(value ?? [])}
                >
                  <MultiSelectTrigger>
                    <MultiSelectValue placeholder="Nightmare" />
                  </MultiSelectTrigger>
                  <MultiSelectContent>
                    {options.map(({ label, value }) => (
                      <MultiSelectItem key={value} value={value}>
                        {label}
                      </MultiSelectItem>
                    ))}
                  </MultiSelectContent>
                </MultiSelect>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            );
          }}
        />

        <Controller
          name="recurring"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field orientation="horizontal" data-invalid={fieldState.invalid}>
              <FieldContent>
                <FieldLabel htmlFor="recurring">Recurring Dream? *</FieldLabel>
                <FieldDescription>
                  Did this dream happen before?
                </FieldDescription>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </FieldContent>
              <Switch
                name={field.name}
                ref={field.ref}
                onBlur={field.onBlur}
                aria-invalid={fieldState.invalid}
                id="recurring"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </Field>
          )}
        />
        <div className="flex justify-end items-center w-full pt-3">
          <Button className="rounded-lg" size="sm">
            {isExecuting ? "Submitting..." : "Submit"}
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}
