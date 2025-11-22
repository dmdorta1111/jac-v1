"use client";

import { HexColorPicker } from "react-colorful";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { useConfigurator } from "./Configurator";

export const Interface = () => {
  const {
    tableWidth,
    setTableWidth,
    tableLength,
    setTableLength,
    tableHeight,
    setTableHeight,
    Material,
    setMaterial,
    tablecolor,
    setTablecolor,
  } = useConfigurator();

  const [opened, setOpened] = useState(() => {
    // Check window width on client side only during initial render
    if (typeof window !== "undefined") {
      return window.innerWidth > 1024;
    }
    return false;
  });

  return (
    <div className="absolute top-0 right-0 bottom-0 overflow-auto p-3">
      <div className="flex flex-col gap-3">
        <Button
          variant="outline"
          onClick={() => setOpened((prev) => !prev)}
          className="self-end"
        >
          <span className="text-xs">{opened ? "Close" : "Open"}</span>
        </Button>

        {opened && (
          <>
            {/* Color Picker & Dimensions */}
            <Card className="glass border-0">
              <CardContent className="p-4 space-y-4">
                {/* Color Picker */}
                <section className="picker">
                  <HexColorPicker
                    color={tablecolor}
                    onChange={(color) => setTablecolor(color)}
                  />
                </section>

                {/* Dimensions */}
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-foreground">
                      Length
                    </label>
                    <Input
                      type="number"
                      min={50}
                      max={200}
                      value={tableLength}
                      onChange={(e) => setTableLength(Number(e.target.value))}
                      className="w-24"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-foreground">
                      Width
                    </label>
                    <Input
                      type="number"
                      min={50}
                      max={200}
                      value={tableWidth}
                      onChange={(e) => setTableWidth(Number(e.target.value))}
                      className="w-24"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-foreground">
                      Height
                    </label>
                    <Input
                      type="number"
                      min={50}
                      max={200}
                      value={tableHeight}
                      onChange={(e) => setTableHeight(Number(e.target.value))}
                      className="w-24"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Material Selection */}
            <Card className="glass border-0">
              <CardContent className="p-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Material
                  </label>
                  <RadioGroup
                    value={String(Material)}
                    onValueChange={(value) => setMaterial(parseInt(value))}
                    className="space-y-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="0" id="stainless" />
                      <label
                        htmlFor="stainless"
                        className="text-sm text-foreground cursor-pointer"
                      >
                        Stainless
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="1" id="galvanized" />
                      <label
                        htmlFor="galvanized"
                        className="text-sm text-foreground cursor-pointer"
                      >
                        Galvanized
                      </label>
                    </div>
                  </RadioGroup>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};
