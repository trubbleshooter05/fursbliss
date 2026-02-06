"use client";

import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type PetSwitcherProps = {
  pets: { id: string; name: string }[];
};

export function PetSwitcher({ pets }: PetSwitcherProps) {
  const router = useRouter();

  if (pets.length === 0) {
    return null;
  }

  return (
    <Select onValueChange={(value) => router.push(`/pets/${value}`)}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Switch pet" />
      </SelectTrigger>
      <SelectContent>
        {pets.map((pet) => (
          <SelectItem key={pet.id} value={pet.id}>
            {pet.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
