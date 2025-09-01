import Button from "../ui/Button";
import { DeleteConfirmModal } from "../ui/Modal";
import Spiner from "../ui/Spiner";

interface DeleteGoalModalProps {
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  onConfirm: () => void;
  goalTitle: string;
}

export const DeleteGoalModal: React.FC<DeleteGoalModalProps> = ({
  isOpen,
  isLoading,
  goalTitle,
  onClose,
  onConfirm,
}) => {

  if (!isOpen) {
    return <></>;
  }

  return (
    <DeleteConfirmModal isOpen={isOpen} onClose={onClose}>
      <p className="text-sm text-muted-foreground">
        Vous êtes sur le point de supprimer l'objectif&nbsp;
        <span className="font-semibold text-foreground">"{goalTitle}"</span>.
        Cette action est irréversible.
        Êtes-vous sûr de vouloir continuer ?
      </p>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>
          Annuler
        </Button>
        <Button variant="destructive" onClick={onConfirm} disabled={isLoading}>
          {isLoading && <Spiner />}
          {isLoading ? "Suppression..." : "Supprimer"}
        </Button>
      </div>
    </DeleteConfirmModal>
  );
};
