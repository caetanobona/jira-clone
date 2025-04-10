'use client'

import { z } from "zod";
import { useRef } from "react";
import { useForm } from "react-hook-form";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";

import { Avatar, AvatarFallback } from "@radix-ui/react-avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"

import { createWorkspaceSchema } from "../schemas";
import { DottedSeparator } from "@/components/dotted-separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCreateWorkspace } from "../api/use-create-workspace.ts";
import { ImageIcon } from "lucide-react";

interface CreateWorkspaceFormProps {
  onCancel? : () => void;
};

export const CreateWorkspaceForm = ({ onCancel }: CreateWorkspaceFormProps) => {
  const { mutate, isPending } = useCreateWorkspace();

  const inputRef = useRef<HTMLInputElement>(null)
  
  const form = useForm<z.infer<typeof createWorkspaceSchema>>({
    resolver : zodResolver(createWorkspaceSchema),
    defaultValues : {
      name: ""
    }
  });

  const onSubmit = (values : z.infer<typeof createWorkspaceSchema>) => {
    const finalValues = {
      ...values,
      image: values.image instanceof File ? values.image : "" // zodValidator(createWorkspaceSchema) will treat "" as undefined
    }

    mutate({ form: finalValues }, {
      onSuccess: () => {
        form.reset();
        // TODO : Redirect to new workspace
      }
    })
  }

  const handleImageChange = (e : React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; // getting the file from the onChange event
    if (file) {
      form.setValue("image", file) // setting the new image as the value for the "image" input
    }
  }

  return (
    <Card className="w-full h-full border-none shadow-none">
      <CardHeader className="flex p-7">
        <CardTitle className="text-xl font-bold">
          Create a new workspace
        </CardTitle>
      </CardHeader>
      <div className="px-7">
        <DottedSeparator />
      </div>
      <CardContent className="p-7">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} action="">
            <div className="flex flex-col gap-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Workspace Name
                    </FormLabel>
                    <FormControl>
                      <Input 
                        {...field}
                        placeholder="Enter workspace name"
                      />
                    </FormControl>
                  </FormItem>
                )}      
              />
              {/* <FormField  --> removed input for images because retrieving files from appwrite's storage is a paid feature
                control={form.control}
                name="image"
                render={({ field }) => (
                  <div className="flex flex-col gap-y-2">
                    <div className="flex items-center gap-x-5">
                      {field.value ? ( // if the user added an image, show it
                        <div className="size-[72px] relative rounded-md overflow-hidden">
                          <Image 
                            alt="Logo"
                            fill
                            className="object-cover"
                            src={
                              field.value instanceof File
                                ? URL.createObjectURL(field.value) // if the image is a file, display it (through ObjectURL)
                                : field.value // if the image is not a file, show the value (probably an URL)
                            }
                          />
                        </div>
                      ) : ( // if the user didnt add an image, show an image icon
                        <Avatar className="size-[72px]">
                          <AvatarFallback>
                            <ImageIcon className="size-[36px] text-neutral-400"/>
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div className="flex flex-col">
                        <p className="text-sm">Workspace Icon</p>
                        <p className="text-sm text-muted-foreground">
                          JPG, PNG, SVG or JPEG, max 1mb
                        </p>
                        <input // hidden native input to hold the value
                          className="hidden"
                          type="file"
                          accept=".jpg, .png, .jpeg, .svg"
                          ref={inputRef}
                          onChange={handleImageChange}
                          disabled={isPending}
                        />
                        <Button // Button to call the hidden native input above
                          type="button"
                          disabled={isPending}
                          variant="teritary"
                          size="xs"
                          className="w-fit mt-2"
                          onClick={() => inputRef.current?.click()}
                        >
                          Upload Image
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              /> */}
            </div>
            <DottedSeparator className="py-7"/>
            <div className="flex items-center justify-between">
              <Button
                type="button"
                size="lg"
                variant="secondary"
                onClick={onCancel}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="lg"
                disabled={isPending}
              >
                Create Workspace
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}