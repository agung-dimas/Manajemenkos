export interface FacilityItem {
  name: string
  icon: string
  category?: "Elektronik" | "Mebel/Perabot" | "Sanitasi" | "Layanan/Fasilitas Umum" | "Lainnya"
}

export const DEFAULT_FACILITIES: FacilityItem[] = [
  { name: "AC", icon: "Wind", category: "Elektronik" },
  { name: "Kasur Springbed", icon: "Bed", category: "Mebel/Perabot" },
  { name: "Lemari Pakaian", icon: "DoorClosed", category: "Mebel/Perabot" },
  { name: "Meja & Kursi Belajar", icon: "Armchair", category: "Mebel/Perabot" },
  { name: "Kamar Mandi Dalam", icon: "Bath", category: "Sanitasi" },
  { name: "WiFi Cepat", icon: "Wifi", category: "Layanan/Fasilitas Umum" },
  { name: "Smart TV", icon: "Tv", category: "Elektronik" },
  { name: "Kulkas Mini", icon: "Refrigerator", category: "Elektronik" },
  { name: "Water Heater", icon: "ShowerHead", category: "Sanitasi" },
  { name: "Kipas Angin", icon: "Fan", category: "Elektronik" },
  { name: "Dispenser Air", icon: "Droplets", category: "Elektronik" },
  { name: "Dapur Bersama", icon: "Utensils", category: "Layanan/Fasilitas Umum" },
  { name: "Jendela & Ventilasi", icon: "Maximize2", category: "Lainnya" },
  { name: "CCTV 24 Jam", icon: "ShieldCheck", category: "Layanan/Fasilitas Umum" },
  { name: "Parkir Motor & Mobil", icon: "Car", category: "Layanan/Fasilitas Umum" },
  { name: "Token Listrik Mandiri", icon: "Zap", category: "Elektronik" },
  { name: "Cermin Dinding", icon: "Square", category: "Mebel/Perabot" },
  { name: "Sprei & Bantal", icon: "Sparkles", category: "Mebel/Perabot" },
]

export function getIconForFacility(name: string): string {
  const normalized = name.toLowerCase()
  if (normalized.includes("ac") || normalized.includes("pendingin")) return "Wind"
  if (normalized.includes("kasur") || normalized.includes("springbed") || normalized.includes("bed")) return "Bed"
  if (normalized.includes("lemari") || normalized.includes("wardrobe")) return "DoorClosed"
  if (normalized.includes("meja") || normalized.includes("kursi")) return "Armchair"
  if (normalized.includes("mandi") || normalized.includes("toilet") || normalized.includes("wc")) return "Bath"
  if (normalized.includes("wifi") || normalized.includes("internet")) return "Wifi"
  if (normalized.includes("tv") || normalized.includes("televisi")) return "Tv"
  if (normalized.includes("kulkas") || normalized.includes("refrigerator")) return "Refrigerator"
  if (normalized.includes("heater") || normalized.includes("air panas")) return "ShowerHead"
  if (normalized.includes("kipas") || normalized.includes("fan")) return "Fan"
  if (normalized.includes("dispenser") || normalized.includes("galon") || normalized.includes("air")) return "Droplets"
  if (normalized.includes("dapur") || normalized.includes("masak")) return "Utensils"
  if (normalized.includes("jendela") || normalized.includes("balkon")) return "Maximize2"
  if (normalized.includes("cctv") || normalized.includes("keamanan") || normalized.includes("security")) return "ShieldCheck"
  if (normalized.includes("parkir") || normalized.includes("motor") || normalized.includes("mobil")) return "Car"
  if (normalized.includes("listrik") || normalized.includes("token")) return "Zap"
  if (normalized.includes("cermin") || normalized.includes("kaca")) return "Square"
  if (normalized.includes("bantal") || normalized.includes("sprei") || normalized.includes("selimut")) return "Sparkles"
  return "Package"
}
