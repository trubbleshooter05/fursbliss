"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

type DeletePetDialogProps = {
  petId: string;
  petName: string;
};

export function DeletePetDialog({ petId, petName }: DeletePetDialogProps) {
  const router = useRouter();
  const { toast } = useToast();

  const handleDelete = async () => {
    const response = await fetch(`/api/pets/${petId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      toast({
        title: "Unable to delete pet",
        description: "Please try again in a moment.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Pet deleted",
      description: `${petName} was removed from your account.`,
    });
    router.push("/pets");
    router.refresh();
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive">Delete Pet</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete {petName}?</DialogTitle>
          <DialogDescription>
            This will permanently remove the pet profile and all associated
            health logs.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </DialogClose>
          <Button variant="destructive" onClick={handleDelete}>
            Confirm Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
