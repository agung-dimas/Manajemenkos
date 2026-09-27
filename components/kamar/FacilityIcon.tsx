import {
  Wind,
  Bed,
  DoorClosed,
  Armchair,
  Bath,
  Wifi,
  Tv,
  Refrigerator,
  ShowerHead,
  Fan,
  Droplets,
  Utensils,
  Maximize2,
  ShieldCheck,
  Car,
  Zap,
  Square,
  Sparkles,
  Package,
  CheckCircle2,
  LucideIcon
} from "lucide-react"

const ICON_MAP: Record<string, LucideIcon> = {
  Wind,
  Bed,
  DoorClosed,
  Armchair,
  Bath,
  Wifi,
  Tv,
  Refrigerator,
  ShowerHead,
  Fan,
  Droplets,
  Utensils,
  Maximize2,
  ShieldCheck,
  Car,
  Zap,
  Square,
  Sparkles,
  Package,
  CheckCircle2
}

interface FacilityIconProps {
  name: string
  className?: string
}

export function FacilityIcon({ name, className = "h-4 w-4" }: FacilityIconProps) {
  const IconComponent = ICON_MAP[name] || Package
  return <IconComponent className={className} />
}
