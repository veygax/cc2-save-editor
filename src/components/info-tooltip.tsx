"use client"

import React from "react"
import { InfoIcon } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface InfoTooltipProps {
  content: string
  className?: string
}

export function InfoTooltip({ content, className = "" }: InfoTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <InfoIcon 
          className={`inline-block h-4 w-4 text-blue-500 cursor-help ml-1 ${className}`} 
        />
      </TooltipTrigger>
      <TooltipContent>
        <p>{content}</p>
      </TooltipContent>
    </Tooltip>
  )
} 