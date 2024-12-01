import { Icon } from "@/components/ui/icon";
import type { icons } from "lucide-react";
import { use, useEffect, useMemo } from "react";
import * as Dropdown from "@radix-ui/react-dropdown-menu";
import { Toolbar } from "../../../../../components/ui/toolbar";

import { Surface } from "@/components/ui/surface";
import {
  DropdownButton,
  DropdownCategoryTitle,
} from "@/components/ui/dropdown";
import { useBlockEditor } from "@/features/editor/hooks/use-block-editor";

export type ContentTypePickerOption = {
  label: string;
  id: string;
  type: "option";
  disabled: () => boolean;
  isActive: () => boolean;
  onClick: () => void;
  icon: keyof typeof icons;
};

export type ContentTypePickerCategory = {
  label: string;
  id: string;
  type: "category";
};

export type ContentPickerOptions = Array<
  ContentTypePickerOption | ContentTypePickerCategory
>;

export type ContentTypePickerProps = {
  options: ContentPickerOptions;
};

const isOption = (
  option: ContentTypePickerOption | ContentTypePickerCategory
): option is ContentTypePickerOption => option.type === "option";
const isCategory = (
  option: ContentTypePickerOption | ContentTypePickerCategory
): option is ContentTypePickerCategory => option.type === "category";

export const ContentTypePicker = ({ options }: ContentTypePickerProps) => {
  const { editor } = useBlockEditor();
  // console.log(editor.state,'STATE')
  const activeItem = useMemo(
    () =>
      options.find((option) => option.type === "option" && option.isActive()),
    [options]
  );

  useEffect(()=>{
    editor.on("selectionUpdate",(e)=>{
      console.log(e)
    })

  },[editor, editor.state])



  return (
    <Dropdown.Root>
      <Dropdown.Trigger asChild>
        <Toolbar.Button
          active={activeItem?.id !== "paragraph" && !!activeItem?.type}
        >
          <Icon
            name={
              (activeItem?.type === "option" && activeItem.icon) || "Pilcrow"
            }
          />
          <Icon name="ChevronDown" className="size-2" />
        </Toolbar.Button>
      </Dropdown.Trigger>
      <Dropdown.Content asChild>
        <Surface className="flex  flex-col gap-1 px-2">
          {options.map((option) => {
            if (isOption(option)) {
              return (
                <DropdownButton
                  key={option.id}
                  onClick={option.onClick}
                  isActive={option.isActive()}
                >
                  <Icon name={option.icon} className="size-4 mr-1" />
                  {option.label}
                </DropdownButton>
              );
            }
            if (isCategory(option)) {
              return (
                <div className="mt-2" key={option.id}>
                  <DropdownCategoryTitle key={option.id}>
                    {option.label}
                  </DropdownCategoryTitle>
                </div>
              );
            }
          })}
        </Surface>
      </Dropdown.Content>
    </Dropdown.Root>
  );
};
