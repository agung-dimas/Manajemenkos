import { getAvailableRooms } from "@/src/repositories/penghuni.repo"
import { TambahPenghuniForm } from "./TambahPenghuniForm"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function TambahPenghuniPage(props: any) {
  const searchParams = await props?.searchParams
  const preselectedRoomId = searchParams?.roomId as string | undefined

  const availableRooms = await getAvailableRooms()

  return (
    <div className="py-2">
      <TambahPenghuniForm 
        availableRooms={availableRooms} 
        defaultRoomId={preselectedRoomId}
      />
    </div>
  )
}
