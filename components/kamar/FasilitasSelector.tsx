"use client"

import { useState } from "react"
import { DEFAULT_FACILITIES, getIconForFacility } from "@/src/lib/facilities"
import { FacilityIcon } from "./FacilityIcon"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, X, Check, Sparkles } from "lucide-react"

interface FasilitasSelectorProps {
  initialFacilities?: string[]
}

export function FasilitasSelector({ initialFacilities = [] }: FasilitasSelectorProps) {
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>(initialFacilities)
  const [customInput, setCustomInput] = useState("")

  const toggleFacility = (name: string) => {
    setSelectedFacilities(prev =>
      prev.includes(name) ? prev.filter(f => f !== name) : [...prev, name]
    )
  }

  const handleAddCustom = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const trimmed = customInput.trim()
    if (!trimmed) return
    if (!selectedFacilities.includes(trimmed)) {
      setSelectedFacilities(prev => [...prev, trimmed])
    }
    setCustomInput("")
  }

  const removeFacility = (name: string) => {
    setSelectedFacilities(prev => prev.filter(f => f !== name))
  }

  return (
    <div className="space-y-4 rounded-xl border bg-muted/20 p-4 sm:p-5">
      {/* Hidden input for form submission */}
      <input
        type="hidden"
        name="facilities"
        value={JSON.stringify(selectedFacilities)}
      />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b pb-3">
        <div>
          <Label className="text-base font-semibold flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" /> Fasilitas & Inventaris Kamar
          </Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            Pilih fasilitas bawaan atau tambahkan barang inventaris khusus yang disediakan pengelola.
          </p>
        </div>
        <div className="text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary w-fit">
          {selectedFacilities.length} Inventaris Terpilih
        </div>
      </div>

      {/* Selected Items summary tags if any */}
      {selectedFacilities.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Daftar Aktif Kamar Ini:</span>
          <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 bg-background rounded-lg border">
            {selectedFacilities.map(item => {
              const iconName = getIconForFacility(item)
              return (
                <Badge
                  key={item}
                  variant="secondary"
                  className="pl-2 pr-1 py-1 flex items-center gap-1.5 text-xs font-normal border bg-primary/5 text-primary hover:bg-primary/10 transition-colors"
                >
                  <FacilityIcon name={iconName} className="h-3.5 w-3.5 text-primary" />
                  <span>{item}</span>
                  <button
                    type="button"
                    onClick={() => removeFacility(item)}
                    className="h-4 w-4 rounded-full inline-flex items-center justify-center hover:bg-primary/20 text-muted-foreground hover:text-foreground ml-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )
            })}
          </div>
        </div>
      )}

      {/* Default / Popular Facilities to toggle */}
      <div className="space-y-2">
        <span className="text-xs font-medium text-muted-foreground">Pilihan Fasilitas Standar:</span>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {DEFAULT_FACILITIES.map(facility => {
            const isSelected = selectedFacilities.includes(facility.name)
            return (
              <button
                key={facility.name}
                type="button"
                onClick={() => toggleFacility(facility.name)}
                className={`flex items-center justify-between p-2.5 rounded-lg border text-left text-xs transition-all ${
                  isSelected
                    ? "border-primary bg-primary/10 text-primary font-medium shadow-xs"
                    : "border-border bg-card hover:bg-accent/50 text-foreground"
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <FacilityIcon name={facility.icon} className={`h-4 w-4 shrink-0 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                  <span className="truncate">{facility.name}</span>
                </div>
                {isSelected && (
                  <Check className="h-3.5 w-3.5 text-primary shrink-0 ml-1" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Custom Inventory Input */}
      <div className="pt-2 border-t space-y-2">
        <Label htmlFor="custom-facility-input" className="text-xs font-medium text-muted-foreground">
          + Tambah Barang Inventaris Kustom Lainnya:
        </Label>
        <div className="flex gap-2">
          <Input
            id="custom-facility-input"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                handleAddCustom()
              }
            }}
            placeholder="Contoh: Kulkas Sharp 1 Pintu, Dispenser Galon Bawah, Cermin Rias..."
            className="text-xs h-9"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleAddCustom()}
            className="h-9 px-3 shrink-0"
          >
            <Plus className="h-4 w-4 mr-1" /> Tambah
          </Button>
        </div>
      </div>
    </div>
  )
}
