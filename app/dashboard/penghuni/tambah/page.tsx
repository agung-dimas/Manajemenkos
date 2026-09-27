import { getAvailableRooms } from "@/src/repositories/penghuni.repo"
import { TambahPenghuniForm } from "./TambahPenghuniForm"

export default async function TambahPenghuniPage() {
  const availableRooms = await getAvailableRooms()

  return (
    <div className="py-2">
      <TambahPenghuniForm availableRooms={availableRooms} />
    </div>
  )
}
