import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/utils";
import { Node, RawCommands } from "@tiptap/core";
import { NodeViewWrapper, ReactNodeViewRenderer } from "@tiptap/react";
import { EyeOff, Hash, Type } from "lucide-react";
import React, { useState } from "react";

interface DataFieldComponentProps {
  node: any;
  updateAttributes: (attributes: Record<string, any>) => void;
}

const DataFieldComponent: React.FC<DataFieldComponentProps> = ({
  node,
  updateAttributes,
}) => {
  const { fieldId, fieldName } = node.attrs;

  const [localFieldId, setLocalFieldId] = useState(fieldId || "");
  const [localFieldName, setLocalFieldName] = useState(fieldName || "");
  const [isAnonymous, setIsAnonymous] = useState(false);

  // Handle field updates
  const handleFieldIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalFieldId(newValue);
    updateAttributes({ fieldId: newValue });
  };

  const handleFieldNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalFieldName(newValue);
    updateAttributes({ fieldName: newValue });
  };

  const handleAnonymousToggle = (checked: boolean) => {
    setIsAnonymous(checked);
    // Optionally update attributes if anonymity affects the node
    updateAttributes({ isAnonymous: checked });
  };

  return (
    <NodeViewWrapper as={"span"}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <span className={cn(buttonVariants({ variant: "datafield" }))}>
            {localFieldId || "Field ID"}
          </span>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-full min-w-[300px] p-4" align="start">
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="field-id" className="flex items-center gap-2">
                <Hash className="size-4" />
                Field ID
              </Label>
              <Input
                id="field-id"
                placeholder="Enter field ID"
                value={localFieldId}
                onChange={handleFieldIdChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="field-value" className="flex items-center gap-2">
                <Type className="size-4" />
                Field Value
              </Label>
              <Input
                id="field-value"
                placeholder="Enter field value"
                value={localFieldName}
                onChange={handleFieldNameChange}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Switch
                  id="anonymous-mode"
                  checked={isAnonymous}
                  onCheckedChange={handleAnonymousToggle}
                />
                <Label
                  htmlFor="anonymous-mode"
                  className="flex items-center gap-2"
                >
                  <EyeOff className="size-4" />
                  Anonymous
                </Label>
              </div>
            </div>
          </form>
        </DropdownMenuContent>
      </DropdownMenu>
    </NodeViewWrapper>
  );
};

// Custom Tiptap Node Extension
export const DataField = Node.create({
  name: "dataField",

  // Defines the attributes for the node
  addAttributes() {
    return {
      fieldId: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-field-id"),
        renderHTML: (attributes) => ({
          "data-field-id": attributes.fieldId,
        }),
      },
      fieldName: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-field-name"),
        renderHTML: (attributes) => ({
          "data-field-name": attributes.fieldName,
        }),
      },
      isAnonymous: {
        default: false,
        parseHTML: (element) =>
          element.getAttribute("data-anonymous") === "true",
        renderHTML: (attributes) => ({
          "data-anonymous": attributes.isAnonymous ? "true" : null,
        }),
      },
    };
  },

  // Define the schema for the node
  group: "inline",
  inline: true,
  selectable: true,
  draggable: true,

  addCommands() {
    return {
      insertDataField:
        (attributes) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              fieldId: attributes.fieldId || null,
              fieldName: attributes.fieldName || null,
              isAnonymous: attributes.isAnonymous || false,
            },
          });
        },
    } as Partial<RawCommands>;
  },

  // Node view rendering using React
  addNodeView() {
    return ReactNodeViewRenderer(DataFieldComponent);
  },
});
